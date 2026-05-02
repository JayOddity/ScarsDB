import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { auth } from '@/lib/auth';
import { isUserBanned } from '@/lib/bannedUsers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const session = await auth();
  const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;
  const displayName = (session?.user as unknown as Record<string, string | null> | undefined)?.displayName;

  if (!userId) {
    return NextResponse.json(
      { error: 'You must sign in to publish a build.', code: 'NOT_SIGNED_IN' },
      { status: 401 },
    );
  }
  if (!displayName) {
    return NextResponse.json(
      { error: 'Pick a display name before publishing builds.', code: 'NEED_DISPLAY_NAME' },
      { status: 403 },
    );
  }
  if (isUserBanned(userId)) {
    return NextResponse.json({ error: 'Your account has been restricted.' }, { status: 403 });
  }

  const build = await sanityClient.fetch<{ _id: string; authorRef: string | null } | null>(
    `*[_type == "talentBuild" && code == $code][0]{ _id, "authorRef": author._ref }`,
    { code },
  );
  if (!build) {
    return NextResponse.json({ error: 'Build not found.' }, { status: 404 });
  }

  // Ownership: either the user already owns it, OR they own it via cookie and
  // it has no author yet (anon save being claimed at publish time).
  const ownsByAuth = build.authorRef === userId;
  const ownedCookie = request.cookies.get('scarshq-owned-builds')?.value || '';
  const ownsByCookie = ownedCookie.split(',').includes(code);

  if (!ownsByAuth) {
    if (build.authorRef) {
      return NextResponse.json({ error: 'You can only publish your own builds.' }, { status: 403 });
    }
    if (!ownsByCookie) {
      return NextResponse.json({ error: 'You can only publish your own builds.' }, { status: 403 });
    }
  }

  let publish = true;
  try {
    const body = await request.json();
    if (typeof body?.publish === 'boolean') publish = body.publish;
  } catch {
    /* empty body OK — defaults to publish=true */
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: any = { isPublic: publish };
  if (publish) {
    patch.publishedAt = new Date().toISOString();
    // Claim ownership on first publish if anon-saved.
    if (!build.authorRef) patch.author = { _type: 'reference', _ref: userId };
  }

  await sanityWriteClient.patch(build._id).set(patch).commit();

  return NextResponse.json({ ok: true, code, isPublic: publish });
}
