import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { recordBuildView } from '@/lib/buildViewTracker';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code || code.length < 4 || code.length > 10) {
    return NextResponse.json({ error: 'Invalid build code' }, { status: 400 });
  }

  try {
    const build = await sanityClient.fetch(
      `*[_type == "talentBuild" && code == $code][0]{
        code, classSlug, allocation, equipment, name, tags, description, guide, patch, totalPoints, upvotes, downvotes, createdAt, "authorName": author->name, "authorImage": author->image
      }`,
      { code },
    );

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    recordBuildView(code);

    return NextResponse.json(build);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load build', details: String(error) },
      { status: 500 },
    );
  }
}
