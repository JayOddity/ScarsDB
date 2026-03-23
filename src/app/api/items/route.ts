import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search')?.toLowerCase();
    const rarity = searchParams.get('rarity');
    const slot = searchParams.get('slot');
    const type = searchParams.get('type');
    const page = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 50;

    // Build GROQ filter
    const conditions: string[] = ['_type == "item"'];
    const params: Record<string, string> = {};

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
    }
    if (type) {
      conditions.push('itemType == $type');
      params.type = type;
    }

    const filter = conditions.join(' && ');
    const start = (page - 1) * perPage;
    const end = start + perPage;

    // Fetch filtered items and total count in parallel
    const [items, total, allSlots, allTypes, allRarities] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(name asc) [${start}...${end}] {
          "id": externalId,
          name,
          "type": itemType,
          rarity,
          icon,
          "slot_type": slotType,
          "stack_size": stackSize,
          "sell_value": sellValue,
          "is_destructible": isDestructible,
          "stat_configuration": select(
            defined(stats) && length(stats) > 0 => {
              "lists": [{
                "min_stat_count": 1,
                "max_stat_count": count(stats),
                "modifications": stats[] {
                  "stat": stat,
                  "modif_type": modifType,
                  "modif_weight": modifWeight,
                  "modif_min_value": minValue,
                  "modif_max_value": maxValue
                }
              }]
            },
            null
          )
        }`,
        params
      ),
      sanityClient.fetch(`count(*[${filter}])`, params),
      sanityClient.fetch(`array::unique(*[_type == "item" && defined(slotType) && slotType != ""].slotType) | order(@ asc)`),
      sanityClient.fetch(`array::unique(*[_type == "item" && defined(itemType) && itemType != ""].itemType) | order(@ asc)`),
      sanityClient.fetch(`array::unique(*[_type == "item" && defined(rarity)].rarity)`),
    ]);

    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
      filters: { slots: allSlots, types: allTypes, rarities: allRarities },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items', details: String(error) },
      { status: 500 }
    );
  }
}
