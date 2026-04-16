import { sanityClient } from './sanity';

export const ITEM_SORT_ORDER = `| order(
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
)`;

export const ITEM_PROJECTION = `{
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
}`;

export interface ItemFilters {
  slots: string[];
  types: string[];
  rarities: string[];
  stats: string[];
}

export async function fetchItemFilters(): Promise<ItemFilters> {
  const [slots, types, rarities, stats] = await Promise.all([
    sanityClient.fetch<string[]>(
      `array::unique(*[_type == "item" && defined(slotType) && slotType != ""].slotType) | order(@ asc)`,
    ),
    sanityClient.fetch<string[]>(
      `array::unique(*[_type == "item" && defined(itemType) && itemType != ""].itemType) | order(@ asc)`,
    ),
    sanityClient.fetch<string[]>(
      `array::unique(*[_type == "item" && defined(rarity)].rarity)`,
    ),
    sanityClient.fetch<string[]>(
      `array::unique(*[_type == "item" && defined(stats) && length(stats) > 0].stats[].stat) | order(@ asc)`,
    ),
  ]);
  return { slots, types, rarities, stats };
}
