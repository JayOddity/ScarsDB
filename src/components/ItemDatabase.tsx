'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Item } from '@/lib/api';
import { rarityColorClass, rarityBorderClass } from '@/lib/rarityStyles';
import ItemTooltipPanel from './ItemTooltipPanel';

const RARITIES = ['Common', 'Rare', 'Epic', 'Legendary'] as const;


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

// Hover panel uses the shared ItemTooltipPanel.

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
      <ItemTooltipPanel item={item} />
    </div>
  );
}

// --- Main Component ---
interface InitialData {
  items: Item[];
  meta: ApiMeta;
  filters: { slots: string[]; types: string[]; rarities: string[]; stats: string[]; patches?: string[] };
}

export default function ItemDatabase({ initialData, apiUrl = '/api/items', titleSuffix }: { initialData?: InitialData; apiUrl?: string; titleSuffix?: string }) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const urlCat = searchParams.get('cat') || null;
  const [items, setItems] = useState<Item[]>(initialData?.items || []);
  const [meta, setMeta] = useState<ApiMeta | null>(initialData?.meta || null);
  const [filters, setFilters] = useState<{ slots: string[]; types: string[]; rarities: string[]; stats: string[]; patches?: string[] } | null>(initialData?.filters || null);
  const [ready, setReady] = useState(!!initialData);
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
  const latestPatch = initialData?.filters?.patches?.[0] || '';
  const [patchFilter, setPatchFilter] = useState<string>(latestPatch);
  const [patchOpen, setPatchOpen] = useState(false);
  const patchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!patchOpen) return;
    function onClick(e: MouseEvent) {
      if (patchRef.current && !patchRef.current.contains(e.target as Node)) setPatchOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [patchOpen]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'slot_type' | 'tier' | 'damage' | 'strength' | 'dexterity' | 'intelligence' | 'vitality' | 'armor'>('rarity');
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

  // Fetch items
  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', '50');
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (rarityFilter) params.set('rarity', rarityFilter);
    if (statFilters.length) params.set('stats', statFilters.join(','));
    if (patchFilter) params.set('patch', patchFilter);

    // Category → API params
    if (subFilter) {
      params.set('slot', subFilter);
    } else if (activeCategory) {
      if (activeCategory.slots) params.set('slots', activeCategory.slots.join(','));
      if (activeCategory.types) params.set('types', activeCategory.types.join(','));
    }

    try {
      const res = await fetch(`${apiUrl}?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setMeta(data.meta || null);
      if (data.filters) setFilters(data.filters);
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, [page, debouncedSearch, rarityFilter, category, subFilter, statFilters, patchFilter, apiUrl]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const sorted = useMemo(() => {
    const rarityOrder: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
    // Slot category order: weapons first, then armor, then rest
    const slotCategoryOrder: Record<string, number> = {
      'Main Hand': 0, 'Off Hand': 1,
      'Helmet': 2, 'Chest Piece': 3, 'Shoulder Pads': 4, 'Gloves': 5, 'Belt': 6, 'Pants': 7, 'Boots': 8, 'Cape': 9,
      'Amulet': 10, 'Ring': 11,
    };
    const statSortMap: Record<string, string> = {
      damage: 'Damage', strength: 'Strength', dexterity: 'Dexterity',
      intelligence: 'Intelligence', vitality: 'Vitality', armor: 'Armor',
    };

    function getStatMax(item: Item, statName: string): number {
      if (!item.stat_configuration?.lists?.length) return 0;
      const allMods = item.stat_configuration.lists.flatMap((l) => l.modifications);
      if (statName === 'Damage') {
        const maxDmg = allMods.find((m) => m.stat === 'Weapon Max Damage');
        return maxDmg ? parseFloat(maxDmg.modif_max_value) || 0 : 0;
      }
      const matches = allMods.filter((m) => m.stat === statName);
      return matches.reduce((sum, m) => sum + (parseFloat(m.modif_max_value) || 0), 0);
    }

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
      else if (statSortMap[sortBy]) {
        cmp = getStatMax(a, statSortMap[sortBy]) - getStatMax(b, statSortMap[sortBy]);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortBy, sortDir]);


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
    setPatchFilter(latestPatch);
    setSearch('');
    setPage(1);
  }

  const hasActiveFilters = rarityFilter || category || subFilter || statFilters.length || patchFilter !== latestPatch || search;

  if (!ready) {
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
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">Item Database{titleSuffix ? ` — ${titleSuffix}` : ''}</h1>

      <div className="flex gap-2 mb-6">
        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-honor-gold text-void-black">
          Items
        </span>
        <Link
          href="/database/spells"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-surface text-text-muted hover:text-text-primary transition-all"
        >
          Spells
        </Link>
      </div>

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

        {/* Row 3: Rarity + Patch + Search + Clear/Advanced */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select
            value={rarityFilter || ''}
            onChange={(e) => { setRarityFilter(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Rarities</option>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {filters?.patches && filters.patches.length > 0 && (
            <div ref={patchRef} className="relative">
              <button
                type="button"
                onClick={() => setPatchOpen((v) => !v)}
                className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim min-w-[120px] text-left flex items-center justify-between gap-2"
              >
                <span>{patchFilter === 'all' ? 'All patches' : patchFilter === latestPatch ? 'Latest' : patchFilter}</span>
                <span className="opacity-60 text-xs">▼</span>
              </button>
              {patchOpen && (
                <div className="absolute top-full left-0 mt-1 bg-dark-surface border border-border-subtle rounded-lg shadow-lg z-20 min-w-full whitespace-nowrap py-1">
                  {filters.patches.map((p, i) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPatchFilter(p); setPatchOpen(false); setPage(1); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-card-bg ${patchFilter === p ? 'text-honor-gold' : 'text-text-primary'}`}
                    >
                      {i === 0 ? `Latest — ${p}` : p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-20" onClick={() => toggleSort('damage')}>Dmg{sortArrow('damage')}</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-16" onClick={() => toggleSort('strength')}>Str{sortArrow('strength')}</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-16" onClick={() => toggleSort('dexterity')}>Dex{sortArrow('dexterity')}</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-16" onClick={() => toggleSort('intelligence')}>Int{sortArrow('intelligence')}</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-16" onClick={() => toggleSort('vitality')}>Vit{sortArrow('vitality')}</th>
                      <th className="text-center py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-honor-gold hidden xl:table-cell select-none w-16" onClick={() => toggleSort('armor')}>Armor{sortArrow('armor')}</th>
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
                            <Link href={item.slug ? `/database/${item.slug}` : item.external_id ? `/items/${item.external_id}` : `/items/${item.id}`} className="flex items-center gap-3">
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
