import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

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
      const slotList = slots.split(',');
      conditions.push('slotType in $slots');
      params.slots = slotList;
    }
    if (type) {
      conditions.push('itemType == $type');
      params.type = type;
    } else if (types) {
      const typeList = types.split(',');
      conditions.push('itemType in $types');
      params.types = typeList;
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

    // Fetch filtered items and total count in parallel
    const [items, total, allSlots, allTypes, allRarities, allStats] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(
          select(
            slotType == "Main Hand" => 0,
            slotType == "Off Hand" => 1,
            slotType == "Helmet" => 2,
            slotType == "Chest Piece" => 3,
            slotType == "Shoulder Pads" => 4,
            slotType == "Gloves" => 5,
            slotType == "Belt" => 6,
            slotType == "Pants" => 7,
            slotType == "Boots" => 8,
            slotType == "Cape" => 9,
            slotType == "Amulet" => 10,
            slotType == "Ring" => 11,
            99
          ) asc,
          select(rarity == "Legendary" => 0, rarity == "Epic" => 1, rarity == "Rare" => 2, 3) asc,
          name asc
        ) [${start}...${end}] {
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
                "min_stat_count": length(stats),
                "max_stat_count": length(stats),
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
      sanityClient.fetch(`array::unique(*[_type == "item" && defined(stats) && length(stats) > 0].stats[].stat) | order(@ asc)`),
    ]);

    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
      filters: { slots: allSlots, types: allTypes, rarities: allRarities, stats: allStats },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items', details: String(error) },
      { status: 500 }
    );
  }
}
