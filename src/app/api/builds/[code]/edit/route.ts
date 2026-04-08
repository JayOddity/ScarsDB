import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { auth } from '@/lib/auth';
import { isUserBanned } from '@/lib/bannedUsers';
import { validateText } from '@/lib/profanityFilter';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const session = await auth();
  const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;

  if (userId && isUserBanned(userId)) {
    return NextResponse.json({ error: 'Your account has been restricted.' }, { status: 403 });
  }

  // Check ownership via cookie
  const ownedCookie = request.cookies.get('scarshq-owned-builds')?.value || '';
  const ownedCodes = ownedCookie.split(',');
  const ownsByCookie = ownedCodes.includes(code);

  // Find the build and verify ownership
  const build = await sanityClient.fetch<{ _id: string; authorRef: string | null } | null>(
    `*[_type == "talentBuild" && code == $code][0]{ _id, "authorRef": author._ref }`,
    { code },
  );
  if (!build) {
    return NextResponse.json({ error: 'Build not found.' }, { status: 404 });
  }

  const ownsByAuth = userId && build.authorRef === userId;
  if (!ownsByAuth && !ownsByCookie) {
    return NextResponse.json({ error: 'You can only edit your own builds.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, tags, description, guide, allocation, equipment } = body;

    // Profanity checks
    if (name !== undefined) {
      const err = validateText(name, 'Build name');
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
    if (description !== undefined) {
      const err = validateText(description, 'Description');
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
    if (guide !== undefined) {
      const err = validateText(guide, 'Guide');
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    // Build the patch — only update fields that were sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: any = {};
    if (typeof name === 'string') patch.name = name.slice(0, 50);
    if (Array.isArray(tags)) patch.tags = tags.filter((t: string) => ['pvp', 'pve', 'leveling', 'beginner'].includes(t));
    if (typeof description === 'string') patch.description = description.slice(0, 500);
    if (typeof guide === 'string') patch.guide = guide.slice(0, 50000);
    if (typeof allocation === 'string' && /^(\d+:\d+)(,\d+:\d+)*$/.test(allocation)) {
      patch.allocation = allocation;
      patch.totalPoints = allocation.split(',').reduce((sum: number, pair: string) => sum + (parseInt(pair.split(':')[1], 10) || 0), 0);
    }
    if (typeof equipment === 'string') patch.equipment = equipment.slice(0, 5000);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    await sanityWriteClient.patch(build._id).set(patch).commit();

    return NextResponse.json({ ok: true, code });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update build', details: String(error) }, { status: 500 });
  }
}
