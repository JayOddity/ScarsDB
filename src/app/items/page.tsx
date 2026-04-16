import { sanityClient } from '@/lib/sanity';
import { ITEM_SORT_ORDER, ITEM_PROJECTION, fetchItemFilters } from '@/lib/itemQueries';
import ItemDatabase from '@/components/ItemDatabase';

export const metadata = {
  title: 'Item Database - ScarsHQ',
  description: 'Browse every blade, shield, and relic forged in Aragon. Filter by slot, rarity, and type.',
  alternates: { canonical: '/items' },
};

async function getInitialItems() {
  const perPage = 50;
  const filter = '_type == "item"';

  const [items, total, filters] = await Promise.all([
    sanityClient.fetch(
      `*[${filter}] ${ITEM_SORT_ORDER} [0...${perPage}] ${ITEM_PROJECTION}`,
    ),
    sanityClient.fetch<number>(`count(*[${filter}])`),
    fetchItemFilters(),
  ]);

  return {
    items,
    meta: {
      total,
      page: 1,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
    filters,
  };
}

export default async function ItemsPage() {
  const initialData = await getInitialItems();
  return <ItemDatabase initialData={initialData} />;
}
