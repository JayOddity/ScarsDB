import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

const ITEM_PROJECTION = `{
  "id": externalId,
  "slug": slug.current,
  name,
  "type": itemType,
  rarity,
  icon,
  "slot_type": slotType,
  "stack_size": stackSize,
  "sell_value": sellValue,
  "is_destructible": isDestructible,
  "stat_configuration": select(
    defined(statLists) && length(statLists) > 0 => {
      "lists": statLists[] {
        "min_stat_count": minStatCount,
        "max_stat_count": maxStatCount,
        "modifications": modifications[] {
          "stat": stat,
          "modif_type": modifType,
          "modif_weight": modifWeight,
          "modif_min_value": minValue,
          "modif_max_value": maxValue
        }
      }
    },
    null
  )
}`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
  }

  try {
    const item = await sanityClient.fetch(
      `*[_type == "item" && (externalId == $id || _id == $id || _id == $prefixedId)][0] ${ITEM_PROJECTION}`,
      { id, prefixedId: `item-${id}` },
    );

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch item', details: String(error) },
      { status: 500 },
    );
  }
}
