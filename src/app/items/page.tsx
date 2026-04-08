import { sanityClient } from '@/lib/sanity';
import ItemDatabase from '@/components/ItemDatabase';

export const metadata = {
  title: 'Item Database - ScarsHQ',
  description: 'Browse every blade, shield, and relic forged in Aragon. Filter by slot, rarity, and type.',
  alternates: { canonical: '/items' },
};

async function getInitialItems() {
  const perPage = 50;
  const filter = '_type == "item"';

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
      ) [0...${perPage}] {
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
      }`
    ),
    sanityClient.fetch(`count(*[${filter}])`),
    sanityClient.fetch(`array::unique(*[_type == "item" && defined(slotType) && slotType != ""].slotType) | order(@ asc)`),
    sanityClient.fetch(`array::unique(*[_type == "item" && defined(itemType) && itemType != ""].itemType) | order(@ asc)`),
    sanityClient.fetch(`array::unique(*[_type == "item" && defined(rarity)].rarity)`),
    sanityClient.fetch(`array::unique(*[_type == "item" && defined(stats) && length(stats) > 0].stats[].stat) | order(@ asc)`),
  ]);

  return {
    items,
    meta: {
      total,
      page: 1,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
    filters: { slots: allSlots, types: allTypes, rarities: allRarities, stats: allStats },
  };
}

export default async function ItemsPage() {
  const initialData = await getInitialItems();
  return <ItemDatabase initialData={initialData} />;
}
