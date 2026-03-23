'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { Item } from '@/lib/api';

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

interface ApiMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export default function ItemDatabase() {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [filters, setFilters] = useState<{ slots: string[]; types: string[]; rarities: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'slot_type'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', '50');
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (rarityFilter) params.set('rarity', rarityFilter);
    if (slotFilter) params.set('slot', slotFilter);
    if (typeFilter) params.set('type', typeFilter);

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
    }
  }, [page, debouncedSearch, rarityFilter, slotFilter, typeFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const sorted = useMemo(() => {
    const rarityOrder: Record<string, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
    return [...items].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'rarity') cmp = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
      else if (sortBy === 'slot_type') cmp = (a.slot_type || '').localeCompare(b.slot_type || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortBy, sortDir]);

  function getMainStats(item: Item): string {
    if (!item.stat_configuration?.lists?.length) return '—';
    const mods = item.stat_configuration.lists[0].modifications;
    return mods
      .map((m) => {
        const min = parseFloat(m.modif_min_value);
        const max = parseFloat(m.modif_max_value);
        if (min === max) return `${m.stat} ${min}`;
        return `${m.stat} ${min}-${max}`;
      })
      .join(', ');
  }

  function toggleSort(col: 'name' | 'rarity' | 'slot_type') {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  }

  const sortArrow = (col: string) => sortBy !== col ? '' : sortDir === 'asc' ? ' ↑' : ' ↓';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Item Database</h1>
      <p className="text-text-secondary mb-8">
        Every blade, shield, and relic forged in Aragon
        {meta && <> — <span className="text-honor-gold">{meta.total.toLocaleString()}</span> items found</>}.
      </p>

      {/* Filters */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search all 1,603 items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim transition-colors"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Rarity filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setRarityFilter(null); setPage(1); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!rarityFilter ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-text-primary'}`}
              >
                All Rarities
              </button>
              {RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRarityFilter(rarityFilter === r ? null : r); setPage(1); }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${rarityFilter === r ? 'bg-honor-gold text-void-black' : `bg-dark-surface ${rarityColorClass[r]} hover:opacity-80`}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Slot filter */}
            <select
              value={slotFilter || ''}
              onChange={(e) => { setSlotFilter(e.target.value || null); setPage(1); }}
              className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
            >
              <option value="">All Slots</option>
              {filters?.slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Type filter */}
            <select
              value={typeFilter || ''}
              onChange={(e) => { setTypeFilter(e.target.value || null); setPage(1); }}
              className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
            >
              <option value="">All Types</option>
              {filters?.types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 bg-card-bg border border-border-subtle rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 px-2 text-text-muted font-medium w-10">Icon</th>
                  <th className="text-left py-3 px-2 text-text-muted font-medium cursor-pointer hover:text-honor-gold select-none" onClick={() => toggleSort('name')}>
                    Name{sortArrow('name')}
                  </th>
                  <th className="text-left py-3 px-2 text-text-muted font-medium hidden md:table-cell">Stats</th>
                  <th className="text-left py-3 px-2 text-text-muted font-medium cursor-pointer hover:text-honor-gold hidden sm:table-cell select-none" onClick={() => toggleSort('slot_type')}>
                    Slot{sortArrow('slot_type')}
                  </th>
                  <th className="text-left py-3 px-2 text-text-muted font-medium cursor-pointer hover:text-honor-gold select-none" onClick={() => toggleSort('rarity')}>
                    Quality{sortArrow('rarity')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle/50 hover:bg-dark-surface/50 transition-colors group">
                    <td className="py-2 px-2">
                      <div className={`w-10 h-10 rounded border-2 ${rarityBorderClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center`}>
                        {item.icon && !item.icon.includes('placehold') ? (
                          <img src={item.icon} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-xs text-text-muted">?</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Link href={`/items/${item.id}`} className={`font-medium hover:underline ${rarityColorClass[item.rarity]}`}>
                        {item.name}
                      </Link>
                      <span className="text-xs text-text-muted ml-2 hidden sm:inline">{item.type}</span>
                    </td>
                    <td className="py-2 px-2 text-xs text-text-muted hidden md:table-cell max-w-xs truncate">{getMainStats(item)}</td>
                    <td className="py-2 px-2 text-xs text-text-secondary hidden sm:table-cell">{item.slot_type || '—'}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs font-medium ${rarityColorClass[item.rarity]}`}>{item.rarity}</span>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-text-muted">No items match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-text-muted">
                Page {meta.page} of {meta.last_page} ({meta.total.toLocaleString()} results)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-dark-surface border border-border-subtle rounded text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {/* Page numbers */}
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
        </>
      )}
    </div>
  );
}
