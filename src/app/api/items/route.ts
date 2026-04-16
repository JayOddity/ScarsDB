import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { ITEM_SORT_ORDER, ITEM_PROJECTION, fetchItemFilters } from '@/lib/itemQueries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search')?.toLowerCase();
    const rarity = searchParams.get('rarity');
    const slot = searchParams.get('slot');
    const slots = searchParams.get('slots');
    const type = searchParams.get('type');
    const types = searchParams.get('types');
    const stat = searchParams.get('stat');
    const stats = searchParams.get('stats');
    const page = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 50;

    // Build GROQ filter
    const conditions: string[] = ['_type == "item"'];
    const params: Record<string, unknown> = {};

    if (search) {
      conditions.push('name match $search');
      params.search = `*${search}*`;
    }
    if (rarity) {
      conditions.push('rarity == $rarity');
      params.rarity = rarity;
    }
    if (slot) {
      conditions.push('slotType == $slot');
      params.slot = slot;
    } else if (slots) {
      conditions.push('slotType in $slots');
      params.slots = slots.split(',');
    }
    if (type) {
      conditions.push('itemType == $type');
      params.type = type;
    } else if (types) {
      conditions.push('itemType in $types');
      params.types = types.split(',');
    }
    if (stat) {
      conditions.push('$stat in stats[].stat');
      params.stat = stat;
    } else if (stats) {
      const statList = stats.split(',');
      // Item must have ALL selected stats
      for (let i = 0; i < statList.length; i++) {
        const paramKey = `stat${i}`;
        conditions.push(`$${paramKey} in stats[].stat`);
        params[paramKey] = statList[i];
      }
    }

    const filter = conditions.join(' && ');
    const start = (page - 1) * perPage;
    const end = start + perPage;

    const [items, total, filters] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] ${ITEM_SORT_ORDER} [${start}...${end}] ${ITEM_PROJECTION}`,
        params,
      ),
      sanityClient.fetch<number>(`count(*[${filter}])`, params),
      fetchItemFilters(),
    ]);

    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items', details: String(error) },
      { status: 500 }
    );
  }
}
