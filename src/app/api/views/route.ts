import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import {
  recordView,
  getPopularIds,
  getCachedPopular,
  setCachedPopular,
  isCacheStale,
} from '@/lib/viewTracker';

// POST - record a view
export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json();
    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'Invalid itemId' }, { status: 400 });
    }
    recordView(itemId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// GET - return popular items (cached every 2 hours)
export async function GET() {
  try {
    if (!isCacheStale()) {
      const cached = getCachedPopular();
      return NextResponse.json({ items: cached.items, cachedAt: cached.cachedAt });
    }

    const popularIds = getPopularIds(10);

    if (popularIds.length === 0) {
      // No views tracked yet - return some recent items as fallback
      const fallback = await sanityClient.fetch(
        `*[_type == "item" && defined(icon) && icon != ""] | order(_updatedAt desc) [0...10] {
          "id": externalId,
          "slug": slug.current,
          name,
          rarity,
          icon,
          "type": itemType,
          "slot_type": slotType
        }`
      );
      const items = fallback.map((item: Record<string, string>) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        rarity: item.rarity,
        icon: item.icon,
        type: item.type,
        slot_type: item.slot_type,
        count: 0,
      }));
      setCachedPopular(items, Date.now());
      return NextResponse.json({ items, cachedAt: Date.now(), fallback: true });
    }

    // Fetch item details from Sanity for the popular IDs
    const items = await sanityClient.fetch(
      `*[_type == "item" && externalId in $ids] {
        "id": externalId,
        "slug": slug.current,
        name,
        rarity,
        icon,
        "type": itemType,
        "slot_type": slotType
      }`,
      { ids: popularIds }
    );

    // Reorder by popularity and attach view counts
    const idToCount = new Map<string, number>();
    const ids = getPopularIds(10);
    ids.forEach((id, i) => idToCount.set(id, ids.length - i));

    const viewCounts = new Map<string, number>();
    for (const [, entry] of Object.entries(popularIds)) {
      viewCounts.set(entry, idToCount.get(entry) || 0);
    }

    const enriched = items
      .map((item: Record<string, string>) => ({
        ...item,
        count: idToCount.get(item.id) || 0,
      }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count);

    setCachedPopular(enriched, Date.now());
    return NextResponse.json({ items: enriched, cachedAt: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get popular items', details: String(error) },
      { status: 500 }
    );
  }
}
