import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

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

let cache: { items: ParsedItem[]; mtime: number } | null = null;
function loadItems(): ParsedItem[] {
  const file = path.join(process.cwd(), 'public', 'data', 'playtest-items.json');
  const mtime = fs.statSync(file).mtimeMs;
  if (cache && cache.mtime === mtime) return cache.items;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as { obtainable: ParsedItem[] };
  cache = { items: raw.obtainable, mtime };
  return cache.items;
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
    })),
  };
}

function toApiShape(it: ParsedItem) {
  const lists = [];
  if (it.stats?.base) lists.push(reshapeStatPool(it.stats.base));
  if (it.stats?.primary) lists.push(reshapeStatPool(it.stats.primary));
  if (it.stats?.secondary) lists.push(reshapeStatPool(it.stats.secondary));
  return {
    id: String(it.id),
    external_id: it.beastBurstId || null,
    slug: it.slug || null,
    name: it.name,
    type: it.itemType,
    rarity: it.rarity,
    icon: it.icon || '',
    slot_type: it.slotType === 'None' ? '' : it.slotType,
    stack_size: it.stackSize,
    sell_value: it.sellValue,
    is_destructible: it.isDestructible,
    added_in_patch: it.addedInPatch || null,
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

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const search = sp.get('search')?.toLowerCase();
  const rarity = sp.get('rarity');
  const slot = sp.get('slot');
  const slots = sp.get('slots')?.split(',');
  const type = sp.get('type');
  const types = sp.get('types')?.split(',');
  const stats = sp.get('stats')?.split(',');
  const patch = sp.get('patch'); // "all" or specific patch label
  const page = Number(sp.get('page')) || 1;
  const perPage = Number(sp.get('per_page')) || 50;

  const all = loadItems();
  const filtered = all.filter((it) => {
    if (search && !it.name.toLowerCase().includes(search)) return false;
    if (rarity && it.rarity !== rarity) return false;
    if (slot && it.slotType !== slot) return false;
    if (slots && slots.length && !slots.includes(it.slotType)) return false;
    if (type && it.itemType !== type) return false;
    if (types && types.length && !types.includes(it.itemType)) return false;
    if (stats && stats.length) {
      const itemStats = flattenStatNames(it);
      for (const s of stats) {
        if (!itemStats.includes(s)) return false;
      }
    }
    if (patch && patch !== 'all' && it.addedInPatch !== patch) return false;
    return true;
  });

  // Sort: weapons first, then armor, then rest; then rarity desc; then name.
  const slotOrder: Record<string, number> = {
    'Main Hand': 0, 'Off Hand': 1,
    'Helmet': 2, 'Chest Piece': 3, 'Shoulder Pads': 4, 'Gloves': 5,
    'Belt': 6, 'Pants': 7, 'Boots': 8, 'Cape': 9,
    'Amulet': 10, 'Ring': 11,
  };
  const rarityOrder: Record<string, number> = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
  filtered.sort((a, b) => {
    const so = (slotOrder[a.slotType] ?? 99) - (slotOrder[b.slotType] ?? 99);
    if (so !== 0) return so;
    const ro = (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99);
    if (ro !== 0) return ro;
    return a.name.localeCompare(b.name);
  });

  const start = (page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage).map(toApiShape);

  // Build filter facet lists from the full obtainable set.
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

  return NextResponse.json({
    items: pageItems,
    meta: {
      total: filtered.length,
      page,
      per_page: perPage,
      last_page: Math.ceil(filtered.length / perPage),
    },
    filters: {
      slots: [...slotsSet].sort(),
      types: [...typesSet].sort(),
      rarities: [...raritiesSet],
      stats: [...statsSet].sort(),
      patches: [...patchesSet],
    },
  });
}
