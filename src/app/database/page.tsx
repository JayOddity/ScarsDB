import fs from 'node:fs';
import path from 'node:path';
import ItemDatabase from '@/components/ItemDatabase';

export const metadata = {
  title: 'Item Database - ScarsHQ',
  description: 'Browse every blade, shield, and relic forged in Aragon. Filter by slot, rarity, and type.',
  alternates: { canonical: '/database' },
};

interface ParsedMod {
  stat: string;
  modifType: string;
  modifWeight: number;
  modifMinValue: number;
  modifMaxValue: number;
}
interface ParsedStatPool {
  id: number;
  minStatCount: number;
  maxStatCount: number;
  modifications: ParsedMod[];
}
interface ParsedItem {
  id: number;
  name: string;
  rawName: string;
  itemType: string;
  rarity: string;
  slotType: string;
  stackSize: number;
  isDestructible: boolean;
  sellValue: number;
  iconId: number;
  descriptionId: number;
  icon?: string;
  slug?: string;
  beastBurstId?: string;
  addedInPatch?: string;
  stats?: { base: ParsedStatPool | null; primary: ParsedStatPool | null; secondary: ParsedStatPool | null };
}

function reshapeStatPool(p: ParsedStatPool | null | undefined) {
  if (!p) return null;
  return {
    min_stat_count: p.minStatCount,
    max_stat_count: p.maxStatCount,
    modifications: p.modifications.map((m) => ({
      stat: m.stat,
      modif_type: m.modifType,
      modif_weight: m.modifWeight,
      modif_min_value: String(m.modifMinValue),
      modif_max_value: String(m.modifMaxValue),
      created_at: '',
      updated_at: '',
    })),
  };
}

function toApiShape(it: ParsedItem) {
  const lists = [];
  if (it.stats?.base) lists.push(reshapeStatPool(it.stats.base)!);
  if (it.stats?.primary) lists.push(reshapeStatPool(it.stats.primary)!);
  if (it.stats?.secondary) lists.push(reshapeStatPool(it.stats.secondary)!);
  return {
    id: String(it.id),
    external_id: it.beastBurstId || null,
    slug: it.slug || '',
    name: it.name,
    description_key: null,
    type: it.itemType,
    rarity: it.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary',
    icon: it.icon || '',
    slot_type: it.slotType === 'None' ? '' : it.slotType,
    stack_size: it.stackSize,
    sell_value: it.sellValue,
    is_destructible: it.isDestructible,
    added_in_patch: it.addedInPatch || null,
    created_at: '',
    updated_at: '',
    sets: [],
    stat_configuration: lists.length ? { lists } : null,
  };
}

function flattenStatNames(it: ParsedItem): string[] {
  if (!it.stats) return [];
  const names = new Set<string>();
  for (const pool of [it.stats.base, it.stats.primary, it.stats.secondary]) {
    if (!pool) continue;
    for (const m of pool.modifications) names.add(m.stat);
  }
  return [...names];
}

async function getInitialItems() {
  const file = path.join(process.cwd(), 'public', 'data', 'playtest-items.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { obtainable: ParsedItem[] };
  const all = raw.obtainable;

  const slotsSet = new Set<string>();
  const typesSet = new Set<string>();
  const raritiesSet = new Set<string>();
  const statsSet = new Set<string>();
  const patchesSet = new Set<string>();
  for (const it of all) {
    if (it.slotType && it.slotType !== 'None') slotsSet.add(it.slotType);
    if (it.itemType) typesSet.add(it.itemType);
    if (it.rarity) raritiesSet.add(it.rarity);
    if (it.addedInPatch) patchesSet.add(it.addedInPatch);
    for (const s of flattenStatNames(it)) statsSet.add(s);
  }

  const slotOrder: Record<string, number> = {
    'Main Hand': 0, 'Off Hand': 1,
    'Helmet': 2, 'Chest Piece': 3, 'Shoulder Pads': 4, 'Gloves': 5,
    'Belt': 6, 'Pants': 7, 'Boots': 8, 'Cape': 9,
    'Amulet': 10, 'Ring': 11,
  };
  const rarityOrder: Record<string, number> = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
  const sorted = [...all].sort((a, b) => {
    const so = (slotOrder[a.slotType] ?? 99) - (slotOrder[b.slotType] ?? 99);
    if (so !== 0) return so;
    const ro = (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99);
    if (ro !== 0) return ro;
    return a.name.localeCompare(b.name);
  });

  const perPage = 50;
  return {
    items: sorted.slice(0, perPage).map(toApiShape),
    meta: {
      total: all.length,
      page: 1,
      per_page: perPage,
      last_page: Math.ceil(all.length / perPage),
    },
    filters: {
      slots: [...slotsSet].sort(),
      types: [...typesSet].sort(),
      rarities: [...raritiesSet],
      stats: [...statsSet].sort(),
      patches: [...patchesSet],
    },
  };
}

export default async function DatabasePage() {
  const initialData = await getInitialItems();
  return <ItemDatabase initialData={initialData} apiUrl="/api/items-playtest" />;
}
