import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET() {
  try {
    const [items, spells] = await Promise.all([
      sanityClient.fetch<number>(`count(*[_type == "item"])`),
      sanityClient.fetch<number>(`count(*[_type == "spell"])`),
    ]);
    return NextResponse.json({ items, spells });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch counts', details: String(error) }, { status: 500 });
  }
}
