import ItemDatabase from '@/components/ItemDatabase';

export const metadata = {
  title: 'Item Database - ScarsHQ',
  description: 'Browse every blade, shield, and relic forged in Aragon. Filter by slot, rarity, and type.',
};

export default function ItemsPage() {
  return <ItemDatabase />;
}
