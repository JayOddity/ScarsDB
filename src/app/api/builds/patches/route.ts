import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export const revalidate = 300;

export async function GET() {
  try {
    const patches = await sanityClient.fetch<string[]>(
      `array::unique(*[_type == "talentBuild" && defined(patch) && patch != ""].patch)`,
    );
    return NextResponse.json({ patches: patches.filter(Boolean).sort().reverse() });
  } catch {
    return NextResponse.json({ patches: [] });
  }
}
