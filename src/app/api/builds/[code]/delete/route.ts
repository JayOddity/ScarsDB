import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminUsers';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const session = await auth();
  const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;

  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const build = await sanityClient.fetch<{ _id: string } | null>(
    `*[_type == "talentBuild" && code == $code][0]{ _id }`,
    { code },
  );
  if (!build) {
    return NextResponse.json({ error: 'Build not found.' }, { status: 404 });
  }

  // Delete all votes for this build
  const votes = await sanityClient.fetch<{ _id: string }[]>(
    `*[_type == "buildVote" && build._ref == $buildId]{ _id }`,
    { buildId: build._id },
  );
  for (const vote of votes) {
    await sanityWriteClient.delete(vote._id);
  }

  // Delete the build
  await sanityWriteClient.delete(build._id);

  return NextResponse.json({ ok: true, deleted: code });
}
