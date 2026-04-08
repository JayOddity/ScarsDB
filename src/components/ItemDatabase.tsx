'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Item, StatModification } from '@/lib/api';

const RARITIES = ['Common', 'Rare', 'Epic', 'Legendary'] as const;
const rarityColorClass: Record<string, string> = {
  Common: 'rarity-common',
  Rare: 'rarity-rare',
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
};
const rarityBorderClass: Record<string, string> = {
  Common: 'rarity-border-common',
  Rare: 'rarity-border-rare',
  Epic: 'rarity-border-epic',
  Legendary: 'rarity-border-legendary',
};
const rarityGlowClass: Record<string, string> = {
  Common: 'rarity-glow-common',
  Rare: 'rarity-glow-rare',
  Epic: 'rarity-glow-epic',
  Legendary: 'rarity-glow-legendary',
};
const rarityBgClass: Record<string, string> = {
  Common: 'bg-[#9d9d9d]/10',
  Rare: 'bg-[#4a8ff7]/10',
  Epic: 'bg-[#a855f7]/10',
  Legendary: 'bg-[#f59e0b]/10',
};

interface ApiMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

const CATEGORIES_MAP: Record<string, { label: string; slots?: string[]; types?: string[] }> = {
  weapons: { label: 'Weapons', slots: ['Main Hand', 'Off Hand'] },
  armor: { label: 'Armor', slots: ['Helmet', 'Chest Piece', 'Pants', 'Boots', 'Gloves', 'Shoulder Pads', 'Belt', 'Cape'] },
  accessories: { label: 'Accessories', slots: ['Amulet', 'Ring'] },
  tools: { label: 'Tools', slots: ['Mining Tool', 'Woodcutting Tool', 'Fishing Tool', 'Gardening Tool', 'Carving Tool'] },
  consumables: { label: 'Consumables', types: ['Consumable'] },
  materials: { label: 'Materials', types: ['Material'] },
  other: { label: 'Other', types: ['Mount Equipment', 'Valuables'] },
};

// --- Detail Panel Component ---
// Process a stat list: combine Weapon Min/Max Damage into a single "Damage" line
function processStatList(mods: StatModification[]) {
  const minDmg = mods.find((m) => m.stat === 'Weapon Min Damage');
  const maxDmg = mods.find((m) => m.stat === 'Weapon Max Damage');
  const rest = mods.filter((m) => m.stat !== 'Weapon Min Damage' && m.stat !== 'Weapon Max Damage');

  const processed: { label: string; min: number; max: number; type: string }[] = [];

  if (minDmg && maxDmg) {
    const lo = parseFloat(minDmg.modif_min_value) || 0;
    const hi = parseFloat(maxDmg.modif_max_value) || 0;
    processed.push({ label: 'Damage', min: lo, max: hi, type: 'Flat' });
  } else {
    // If only one damage stat, show it as-is
    if (minDmg) rest.unshift(minDmg);
    if (maxDmg) rest.unshift(maxDmg);
  }

  for (const mod of rest) {
    processed.push({
      label: mod.stat,
      min: parseFloat(mod.modif_min_value) || 0,
      max: parseFloat(mod.modif_max_value) || 0,
      type: mod.modif_type,
    });
  }

  return processed;
}

const POOL_LABELS = ['Base Stats', 'Stat Pool 2', 'Stat Pool 3', 'Stat Pool 4'];
const POOL_COLORS = [
  { bar: 'bg-honor-gold', barDim: 'bg-honor-gold/30' },
  { bar: 'bg-rarity-rare', barDim: 'bg-rarity-rare/30' },
  { bar: 'bg-rarity-epic', barDim: 'bg-rarity-epic/30' },
  { bar: 'bg-rarity-legendary', barDim: 'bg-rarity-legendary/30' },
];

function ItemDetailPanel({ item }: { item: Item }) {
  const lists = item.stat_configuration?.lists || [];

  return (
    <div className="detail-panel-enter bg-card-bg border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-xs text-text-muted uppercase tracking-wider">Item Details</span>
      </div>

      {/* Item header */}
      <div className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-lg border-2 ${rarityBorderClass[item.rarity]} ${rarityGlowClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0`}>
            {item.icon && !item.icon.includes('placehold') ? (
              <Image src={item.icon} alt={item.name} width={64} height={64} className="object-cover" />
            ) : (
              <span className="text-lg text-text-muted">?</span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/items/${item.id}`}
              className={`font-heading text-lg leading-tight hover:underline block ${rarityColorClass[item.rarity]}`}
            >
              {item.name}
            </Link>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded ${rarityBgClass[item.rarity]} ${rarityColorClass[item.rarity]}`}>
                {item.rarity}
              </span>
              {item.type && (
                <span className="text-xs text-text-muted">{item.type}</span>
              )}
            </div>
          </div>
        </div>

        {/* Slot */}
        {item.slot_type && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-text-muted">Slot</span>
            <span className="text-text-secondary">{item.slot_type}</span>
          </div>
        )}

        {/* Stat Pools */}
        {lists.map((list, li) => {
          const processed = processStatList(list.modifications);
          if (!processed.length) return null;
          const maxVal = Math.max(...processed.map((s) => s.max), 1);
          const colors = POOL_COLORS[li] || POOL_COLORS[0];

          return (
            <div key={li} className={`${li > 0 ? 'mt-3 pt-3 border-t border-border-subtle/30' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted uppercase tracking-wider">{POOL_LABELS[li] || `Stat Pool ${li + 1}`}</span>
                <span className="text-xs text-text-muted">
                  {list.min_stat_count === list.max_stat_count
                    ? `${list.min_stat_count} fixed`
                    : `${list.min_stat_count}–${list.max_stat_count} rolls`}
                </span>
              </div>
              {processed.map((stat, si) => {
                const fillPercent = (stat.max / maxVal) * 100;
                const minPercent = (stat.min / maxVal) * 100;
                return (
                  <div key={si}>
                    <div className="flex items-center justify-between py-1 px-3">
                      <span className="text-sm text-text-primary">{stat.label}</span>
                      <span className="text-sm text-honor-gold font-medium ml-2 flex-shrink-0">
                        {stat.min === stat.max ? `+${stat.min}` : `${stat.min} – ${stat.max}`}
                      </span>
                    </div>
                    <div className="mx-3 mb-1">
                      <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden relative">
                        <div
                          className={`absolute inset-y-0 left-0 ${colors.barDim} rounded-full stat-bar-fill`}
                          style={{ width: `${fillPercent}%`, animationDelay: `${(li * 5 + si) * 60}ms` }}
                        />
                        <div
                          className={`absolute inset-y-0 left-0 ${colors.bar} rounded-full stat-bar-fill`}
                          style={{ width: `${minPercent}%`, animationDelay: `${(li * 5 + si) * 60}ms` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Details grid */}
        {(item.sell_value > 0 || item.stack_size > 1) && (
          <div className="mt-4 pt-3 border-t border-border-subtle/50">
            <div className="flex gap-4 text-sm">
              {item.sell_value > 0 && (
                <div>
                  <span className="text-text-muted text-xs">Sell Value</span>
                  <p className="text-text-primary">{item.sell_value}g</p>
                </div>
              )}
              {item.stack_size > 1 && (
                <div>
                  <span className="text-text-muted text-xs">Stack</span>
                  <p className="text-text-primary">{item.stack_size}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Click hint */}
        <p className="mt-3 text-center text-xs text-text-muted">Click item to view full page</p>
      </div>
    </div>
  );
}

// --- Hover Panel (measures its own height to stay on screen) ---
function HoverPanel({ item, mousePos }: { item: Item; mousePos: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const panelW = 356;
    const margin = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const panelH = ref.current?.offsetHeight || 400;

    const left = mousePos.x + panelW + 20 > vw
      ? Math.max(margin, mousePos.x - panelW - 8)
      : mousePos.x + 16;
    const top = Math.max(margin, Math.min(mousePos.y - 20, vh - panelH - margin));

    setPos({ left, top });
  }, [mousePos, item]);

  return (
    <div
      ref={ref}
      className="hidden lg:block fixed w-[340px] z-50 pointer-events-none"
      style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
    >
      <ItemDetailPanel item={item} />
    </div>
  );
}

// --- Main Component ---
export default function ItemDatabase() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const urlCat = searchParams.get('cat') || null;
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [filters, setFilters] = useState<{ slots: string[]; types: string[]; rarities: string[]; stats: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(urlCat);

  // Sync category with URL param when navigating via dropdown
  useEffect(() => {
    setCategory(urlCat);
    setSubFilter(null);
    setPage(1);
  }, [urlCat]);
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [statFilters, setStatFilters] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'slot_type' | 'tier'>('rarity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Category definitions (static, defined outside would be ideal but kept here for locality — use stable ref via `category` key)
  const activeCategory = category ? CATEGORIES_MAP[category] : null;
  const subOptions = activeCategory?.slots || [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch items - only show skeleton on first load
  const initialLoad = useRef(true);
  const fetchItems = useCallback(async () => {
    if (initialLoad.current) setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', '50');
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (rarityFilter) params.set('rarity', rarityFilter);
    if (statFilters.length) params.set('stats', statFilters.join(','));

    // Category → API params
    if (subFilter) {
      params.set('slot', subFilter);
    } else if (activeCategory) {
      if (activeCategory.slots) params.set('slots', activeCategory.slots.join(','));
      if (activeCategory.types) params.set('types', activeCategory.types.join(','));
    }

    try {
      const res = await fetch(`/api/items?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setMeta(data.meta || null);
      if (data.filters) setFilters(data.filters);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  }, [page, debouncedSearch, rarityFilter, category, subFilter, statFilters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const sorted = useMemo(() => {
    const rarityOrder: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
    // Slot category order: weapons first, then armor, then rest
    const slotCategoryOrder: Record<string, number> = {
      'Main Hand': 0, 'Off Hand': 1,
      'Helmet': 2, 'Chest Piece': 3, 'Shoulder Pads': 4, 'Gloves': 5, 'Belt': 6, 'Pants': 7, 'Boots': 8, 'Cape': 9,
      'Amulet': 10, 'Ring': 11,
    };
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'rarity') {
        // Primary: slot category (weapons first, armor next - always ascending)
        const catCmp = (slotCategoryOrder[a.slot_type] ?? 99) - (slotCategoryOrder[b.slot_type] ?? 99);
        if (catCmp !== 0) return catCmp; // always weapons → armor → rest, ignore sortDir for this
        // Secondary: rarity (respects sortDir)
        cmp = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
      }
      else if (sortBy === 'slot_type') cmp = (a.slot_type || '').localeCompare(b.slot_type || '');
      else if (sortBy === 'tier') {
        const ta = parseInt(a.name.match(/T(\d+)/i)?.[1] || '0');
        const tb = parseInt(b.name.match(/T(\d+)/i)?.[1] || '0');
        cmp = ta - tb;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortBy, sortDir]);

  function getMainStats(item: Item): string {
    if (!item.stat_configuration?.lists?.length) return '-';
    // Combine all pools into a summary
    const allMods = item.stat_configuration.lists.flatMap((l) => l.modifications);
    const minDmg = allMods.find((m) => m.stat === 'Weapon Min Damage');
    const maxDmg = allMods.find((m) => m.stat === 'Weapon Max Damage');
    const rest = allMods.filter((m) => m.stat !== 'Weapon Min Damage' && m.stat !== 'Weapon Max Damage');

    const parts: string[] = [];
    if (minDmg && maxDmg) {
      parts.push(`${parseFloat(minDmg.modif_min_value)}-${parseFloat(maxDmg.modif_max_value)} Dmg`);
    }
    for (const m of rest) {
      const min = parseFloat(m.modif_min_value);
      const max = parseFloat(m.modif_max_value);
      const short = m.stat.replace('Armor Penetration', 'ArPen').replace('Magic Penetration', 'MPen').replace('Magic Defence', 'MDef').replace('Cooldown Reduction', 'CDR').replace('Crit Chance', 'Crit');
      parts.push(min === max ? `${short} ${min}` : `${short} ${min}-${max}`);
    }
    return parts.join(', ');
  }

  // Extract a specific stat's value across all pools, combining weapon damage
  function getStatValue(item: Item, statName: string): string {
    if (!item.stat_configuration?.lists?.length) return '';
    const allMods = item.stat_configuration.lists.flatMap((l) => l.modifications);

    if (statName === 'Damage') {
      const minDmg = allMods.find((m) => m.stat === 'Weapon Min Damage');
      const maxDmg = allMods.find((m) => m.stat === 'Weapon Max Damage');
      if (minDmg && maxDmg) {
        return `${parseFloat(minDmg.modif_min_value)} – ${parseFloat(maxDmg.modif_max_value)}`;
      }
      return '';
    }

    // For stats that appear in multiple pools, sum the ranges
    const matches = allMods.filter((m) => m.stat === statName);
    if (!matches.length) return '';
    const totalMin = matches.reduce((sum, m) => sum + (parseFloat(m.modif_min_value) || 0), 0);
    const totalMax = matches.reduce((sum, m) => sum + (parseFloat(m.modif_max_value) || 0), 0);
    if (totalMin === totalMax) return `${totalMin}`;
    return `${totalMin} – ${totalMax}`;
  }

  function getTier(item: Item): string {
    const match = item.name.match(/T(\d+)/i);
    return match ? `T${match[1]}` : '-';
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  }

  const sortArrow = (col: string) => sortBy !== col ? '' : sortDir === 'asc' ? ' ↑' : ' ↓';

  const STAT_SHORT: Record<string, string> = {
    'Armor Penetration': 'Armor Pen',
    'Magic Penetration': 'Magic Pen',
    'Cooldown Reduction': 'Cooldown Reduction',
    'Crit Chance': 'Crit',
    'Magic Defence': 'Magic Def',
    'Weapon Min Damage': 'Min Dmg',
    'Weapon Max Damage': 'Max Dmg',
  };

  // Core stat names to show as pills
  const coreStats = useMemo(() => {
    if (!filters?.stats) return [];
    const priority = ['Strength', 'Dexterity', 'Intelligence', 'Vitality', 'Armor', 'Crit Chance', 'Cooldown Reduction', 'Armor Penetration', 'Magic Penetration', 'Magic Defence'];
    const available = filters.stats.filter((s) => s !== 'Weapon Min Damage' && s !== 'Weapon Max Damage');
    const prioritized = priority.filter((s) => available.includes(s));
    const rest = available.filter((s) => !priority.includes(s));
    return [...prioritized, ...rest];
  }, [filters?.stats]);

  function clearAllFilters() {
    setRarityFilter(null);
    setCategory(null);
    setSubFilter(null);
    setStatFilters([]);
    setSourceFilter('');
    setSearch('');
    setPage(1);
  }

  const hasActiveFilters = rarityFilter || category || subFilter || statFilters.length || sourceFilter || search;

  if (loading && initialLoad.current) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-10 w-64 bg-card-bg rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-card-bg rounded animate-pulse mb-8" />
        <div className="bg-card-bg border border-border-subtle rounded-lg p-5 mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-dark-surface rounded-lg animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
          <div className="h-10 bg-dark-surface rounded-lg animate-pulse" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-12 bg-card-bg border border-border-subtle/50 rounded animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Item Database</h1>
      <p className="text-text-secondary mb-8">
        Every blade, shield, and relic forged in Aragon
        {meta && <> - <span className="text-honor-gold">{meta.total.toLocaleString()}</span> items found</>}.
      </p>

      {/* Filters */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-4 sm:p-5 mb-6 space-y-3">
        {/* Row 1: Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setCategory(null); setSubFilter(null); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !category ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-text-primary'
            }`}
          >
            All Items
          </button>
          {Object.entries(CATEGORIES_MAP).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setCategory(category === key ? null : key); setSubFilter(null); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                category === key ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Row 2: Contextual sub-filter */}
        {category && subOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setSubFilter(null); setPage(1); }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                !subFilter ? 'bg-honor-gold/15 text-honor-gold ring-1 ring-honor-gold/50' : 'bg-dark-surface text-text-muted hover:text-text-primary'
              }`}
            >
              All {activeCategory?.label}
            </button>
            {subOptions.map((slot) => (
              <button
                key={slot}
                onClick={() => { setSubFilter(subFilter === slot ? null : slot); setPage(1); }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  subFilter === slot ? 'bg-honor-gold/15 text-honor-gold ring-1 ring-honor-gold/50' : 'bg-dark-surface text-text-muted hover:text-text-primary'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {/* Row 3: Rarity + Source + Search + Clear/Advanced */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select
            value={rarityFilter || ''}
            onChange={(e) => { setRarityFilter(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Rarities</option>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Sources</option>
            <option value="Drop">Drop</option>
            <option value="Quest Reward">Quest Reward</option>
            <option value="Vendor">Vendor</option>
            <option value="Crafted">Crafted</option>
            <option value="Other">Other</option>
          </select>

          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-surface border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim transition-colors"
            />
          </div>

          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
              advancedOpen || statFilters.length
                ? 'border-honor-gold-dim text-honor-gold bg-honor-gold/10'
                : 'border-border-subtle text-text-muted hover:text-text-primary'
            }`}
          >
            Advanced {advancedOpen ? '▲' : '▼'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-text-muted hover:text-scar-red transition-colors whitespace-nowrap px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced: Stat multi-select */}
        {advancedOpen && coreStats.length > 0 && (
          <div className="pt-3 border-t border-border-subtle/50">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Filter by Stat</label>
            <div className="flex gap-2 flex-wrap">
              {coreStats.map((s) => {
                const active = statFilters.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setStatFilters(active ? statFilters.filter((f) => f !== s) : [...statFilters, s]);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      active
                        ? 'bg-honor-gold/15 text-honor-gold ring-1 ring-honor-gold/50'
                        : 'bg-dark-surface text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {STAT_SHORT[s] || s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {meta && (
        <p className="text-xs text-text-muted mb-3">
          {meta.total.toLocaleString()} results found
        </p>
      )}

      {/* Table */}
      <div>
              <div className="overflow-x-auto bg-card-bg border border-border-subtle rounded-lg">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="border-b-2 border-border-subtle bg-dark-surface/50">
                      <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold select-none w-[280px]" onClick={() => toggleSort('name')}>
                        Name{sortArrow('name')}
                      </th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-20">Dmg</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-16">Str</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-16">Dex</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-16">Int</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-16">Vit</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider hidden xl:table-cell w-16">Armor</th>
                      <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden sm:table-cell select-none w-24" onClick={() => toggleSort('slot_type')}>
                        Slot{sortArrow('slot_type')}
                      </th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden sm:table-cell select-none w-14" onClick={() => toggleSort('tier')}>
                        Tier{sortArrow('tier')}
                      </th>
                      <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold select-none w-24" onClick={() => toggleSort('rarity')}>
                        Rarity{sortArrow('rarity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((item) => {
                      const dmg = getStatValue(item, 'Damage');
                      const str = getStatValue(item, 'Strength');
                      const dex = getStatValue(item, 'Dexterity');
                      const int = getStatValue(item, 'Intelligence');
                      const vit = getStatValue(item, 'Vitality');
                      const armor = getStatValue(item, 'Armor');
                      return (
                        <tr
                          key={item.id}
                          onMouseEnter={(e) => { setHoveredItem(item); setMousePos({ x: e.clientX, y: e.clientY }); }}
                          onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setHoveredItem(null)}
                          className="border-b border-border-subtle/30 hover:bg-dark-surface/30 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <Link href={`/items/${item.id}`} className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded border ${rarityBorderClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0`}>
                                {item.icon && !item.icon.includes('placehold') ? (
                                  <Image src={item.icon} alt={item.name} width={36} height={36} className="object-cover" />
                                ) : (
                                  <span className="text-xs text-text-muted">?</span>
                                )}
                              </div>
                              <span className={`font-medium hover:underline truncate ${rarityColorClass[item.rarity]}`}>
                                {item.name}
                              </span>
                            </Link>
                          </td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{dmg || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{str || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{dex || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{int || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{vit || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden xl:table-cell">{armor || '-'}</td>
                          <td className="py-2.5 px-3 text-xs hidden sm:table-cell">{item.slot_type || '-'}</td>
                          <td className="py-2.5 px-2 text-xs text-center hidden sm:table-cell">{getTier(item)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-xs font-medium ${rarityColorClass[item.rarity]}`}>{item.rarity}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length === 0 && (
                      <tr><td colSpan={10} className="py-12 text-center text-text-muted">No items match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-text-muted">
                    Page {meta.page} of {meta.last_page}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 bg-dark-surface border border-border-subtle rounded text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, meta.last_page) }).map((_, i) => {
                      let p: number;
                      if (meta.last_page <= 5) p = i + 1;
                      else if (page <= 3) p = i + 1;
                      else if (page >= meta.last_page - 2) p = meta.last_page - 4 + i;
                      else p = page - 2 + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                            p === page ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-honor-gold border border-border-subtle'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={page >= meta.last_page}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 bg-dark-surface border border-border-subtle rounded text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
      </div>

      {/* Hover Detail Panel - follows cursor */}
      {hoveredItem && <HoverPanel item={hoveredItem} mousePos={mousePos} />}
    </div>
  );
}
