import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminUsers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  try {
    const { delta } = await request.json();

    // delta can be -2, -1, 0, 1, or 2
    if (typeof delta !== 'number' || delta < -2 || delta > 2) {
      return NextResponse.json({ error: 'Bad delta' }, { status: 400 });
    }
    if (delta === 0) return NextResponse.json({ ok: true });

    const build = await sanityClient.fetch<{ _id: string; upvotes: number; downvotes: number } | null>(
      `*[_type == "talentBuild" && code == $code][0]{ _id, upvotes, downvotes }`,
      { code },
    );
    if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Just adjust the score field — keep upvotes/downvotes in sync
    // Positive delta = more upvotes, negative = more downvotes
    const currentScore = (build.upvotes || 0) - (build.downvotes || 0);
    const newScore = currentScore + delta;

    // Recalculate up/down from score (keep them non-negative)
    const newUpvotes = Math.max(0, newScore);
    const newDownvotes = Math.max(0, -newScore);

    await sanityWriteClient.patch(build._id).set({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    }).commit();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Admin: reset votes to 0
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const session = await auth();
  const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  const build = await sanityClient.fetch<{ _id: string } | null>(
    `*[_type == "talentBuild" && code == $code][0]{ _id }`,
    { code },
  );
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await sanityWriteClient.patch(build._id).set({ upvotes: 0, downvotes: 0 }).commit();

  return NextResponse.json({ ok: true, score: 0 });
}
