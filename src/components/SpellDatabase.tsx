'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatSpellName } from '@/lib/spellName';

// Maps the BeastBurst class names (some legacy: KNIGHT = Paladin) to display
// names + the same accent colours the talent trees use.
const CLASS_META: Record<string, { name: string; color: string }> = {
  WARRIOR: { name: 'Warrior', color: '#c84f3a' },
  KNIGHT: { name: 'Paladin', color: '#e8c432' },
  PALADIN: { name: 'Paladin', color: '#e8c432' },
  RANGER: { name: 'Ranger', color: '#5fa14a' },
  ASSASSIN: { name: 'Assassin', color: '#9c5cb6' },
  PIRATE: { name: 'Pirate', color: '#d18b3e' },
  MAGE: { name: 'Mage', color: '#4a8ff7' },
  PRIEST: { name: 'Priest', color: '#e9d8a6' },
  DRUID: { name: 'Druid', color: '#7bb866' },
  NECROMANCER: { name: 'Necromancer', color: '#7d3a8b' },
  MYSTIC: { name: 'Mystic', color: '#3aa8b4' },
};

interface Spell {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  maxRange?: number;
  targetType?: string;
  channelTime?: number;
  castTime?: number;
  cooldown?: number;
  globalCooldown?: number;
  requiredAmount?: number;
  requiredResource?: string;
  schoolType?: string;
  flags?: string[];
  tags?: string[];
  classSpecLevels?: Array<{ class?: string; spec?: string; level?: number }>;
}

type SortKey = 'name' | 'class' | 'school' | 'resource' | 'cast' | 'cooldown' | 'range' | 'target';
type SortDir = 'asc' | 'desc';

function classMeta(c?: string | null): { name: string; color: string } | null {
  if (!c) return null;
  const upper = c.toUpperCase();
  return CLASS_META[upper] || { name: c.charAt(0) + c.slice(1).toLowerCase(), color: '#888888' };
}

function uniqueClasses(s: Spell): string[] {
  if (!s.classSpecLevels || s.classSpecLevels.length === 0) return [];
  return Array.from(new Set(s.classSpecLevels.map((csl) => csl.class).filter(Boolean) as string[]));
}

function ClassBadges({ spell }: { spell: Spell }) {
  const cls = uniqueClasses(spell);
  if (cls.length === 0) return <span className="text-text-muted">—</span>;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {cls.map((c, i) => {
        const m = classMeta(c);
        if (!m) return null;
        return (
          <span key={c}>
            {i > 0 && <span className="text-text-muted">, </span>}
            <span style={{ color: m.color }}>{m.name}</span>
          </span>
        );
      })}
    </span>
  );
}

interface SpellMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

interface SpellFilters {
  schools: string[];
  resources: string[];
  flags: string[];
  classes: string[];
}

function formatTime(ms?: number): string {
  if (ms == null || ms === 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
}

// Hex colours so we can use them inline (works better than tailwind class
// lookup when arbitrary new schools appear from the API).
const SCHOOL_COLORS: Record<string, string> = {
  Physical: '#f59e0b',
  Fire: '#ef4444',
  Frost: '#67e8f9',
  Nature: '#4ade80',
  Holy: '#fde047',
  Lightning: '#a5b4fc',
  Cosmos: '#c084fc',
  Chaos: '#e879f9',
  Poison: '#84cc16',
  Bleed: '#dc2626',
  All: '#9ca3af',
};
const SCHOOL_FALLBACK = '#9ca3af';

export default function SpellDatabase() {
  const searchParams = useSearchParams();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [meta, setMeta] = useState<SpellMeta | null>(null);
  const [filters, setFilters] = useState<SpellFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [school, setSchool] = useState<string | null>(searchParams.get('school'));
  const [resource, setResource] = useState<string | null>(searchParams.get('resource'));
  const [flag, setFlag] = useState<string | null>(searchParams.get('flag'));
  const [klass, setKlass] = useState<string | null>(searchParams.get('class'));
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [hovered, setHovered] = useState<Spell | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sortBy, setSortBy] = useState<SortKey>('class');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [counts, setCounts] = useState<{ items: number; spells: number } | null>(null);

  useEffect(() => {
    fetch('/api/counts').then((r) => r.json()).then((d) => {
      if (typeof d?.items === 'number' && typeof d?.spells === 'number') setCounts(d);
    }).catch(() => { /* ignore */ });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSpells = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', '50');
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (klass) params.set('class', klass);
    if (school) params.set('school', school);
    if (resource) params.set('resource', resource);
    if (flag) params.set('flag', flag);
    params.set('sort_by', sortBy);
    params.set('sort_dir', sortDir);
    try {
      const res = await fetch(`/api/spells?${params}`);
      const data = await res.json();
      setSpells(data.spells || []);
      setMeta(data.meta || null);
      if (data.filters) setFilters(data.filters);
    } catch {
      setSpells([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, klass, school, resource, flag, sortBy, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
    setPage(1);
  }
  function sortIcon(key: SortKey) {
    const glyph = sortBy !== key ? '↕' : sortDir === 'asc' ? '↑' : '↓';
    const dim = sortBy !== key ? 'opacity-30' : 'opacity-90';
    return <span className={`ml-1 inline-block text-[10px] ${dim}`}>{glyph}</span>;
  }

  // Server-sorted; nothing to do here. Kept name "sorted" so JSX below stays
  // unchanged and we have a single iteration source.
  const sorted = spells;

  useEffect(() => { fetchSpells(); }, [fetchSpells]);

  const hasFilters = klass || school || resource || flag || search;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">Spell Database</h1>

      <div className="flex gap-2 mb-6">
        <Link
          href="/database"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-surface text-text-muted hover:text-text-primary transition-all"
        >
          Items {counts && <span className="ml-1 opacity-60">({counts.items.toLocaleString()})</span>}
        </Link>
        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-honor-gold text-void-black">
          Spells {meta && <span className="ml-1 opacity-70">({meta.total.toLocaleString()})</span>}
        </span>
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-lg p-4 sm:p-5 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={klass || ''}
            onChange={(e) => { setKlass(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Classes</option>
            {filters?.classes.map((c) => (
              <option key={c} value={c}>{classMeta(c)?.name}</option>
            ))}
          </select>
          <select
            value={school || ''}
            onChange={(e) => { setSchool(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Schools</option>
            {filters?.schools.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={resource || ''}
            onChange={(e) => { setResource(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Resources</option>
            {filters?.resources.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={flag || ''}
            onChange={(e) => { setFlag(e.target.value || null); setPage(1); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="">All Flags</option>
            {filters?.flags.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search spells..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-surface border border-border-subtle rounded-lg pl-3 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setKlass(null); setSchool(null); setResource(null); setFlag(null); setPage(1); }}
              className="px-3 py-2 rounded-lg text-sm bg-dark-surface text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-12 bg-card-bg border border-border-subtle/50 rounded animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      ) : spells.length === 0 ? (
        <div className="text-center text-text-muted py-12">No spells match your filters.</div>
      ) : (
        <div className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dark-surface text-text-muted text-xs uppercase tracking-wider select-none">
                <th onClick={() => toggleSort('name')} className="px-4 py-3 text-left cursor-pointer hover:text-text-primary whitespace-nowrap">Spell{sortIcon('name')}</th>
                <th onClick={() => toggleSort('class')} className="px-3 py-3 text-left cursor-pointer hover:text-text-primary whitespace-nowrap">Class{sortIcon('class')}</th>
                <th onClick={() => toggleSort('school')} className="px-3 py-3 text-left cursor-pointer hover:text-text-primary whitespace-nowrap">School{sortIcon('school')}</th>
                <th onClick={() => toggleSort('cooldown')} className="px-3 py-3 text-right cursor-pointer hover:text-text-primary whitespace-nowrap">Cooldown{sortIcon('cooldown')}</th>
                <th onClick={() => toggleSort('resource')} className="px-3 py-3 text-left cursor-pointer hover:text-text-primary whitespace-nowrap">Resource{sortIcon('resource')}</th>
                <th onClick={() => toggleSort('cast')} className="px-3 py-3 text-right cursor-pointer hover:text-text-primary whitespace-nowrap">Cast{sortIcon('cast')}</th>
                <th onClick={() => toggleSort('range')} className="px-3 py-3 text-right cursor-pointer hover:text-text-primary whitespace-nowrap">Range{sortIcon('range')}</th>
                <th onClick={() => toggleSort('target')} className="px-3 py-3 text-left cursor-pointer hover:text-text-primary whitespace-nowrap">Target{sortIcon('target')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const href = s.slug ? `/database/spells/${s.slug}` : '#';
                return (
                  <tr
                    key={s._id}
                    className="border-t border-border-subtle/40 hover:bg-dark-surface/40 transition-colors cursor-pointer"
                    onMouseEnter={() => setHovered(s)}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { if (s.slug) window.location.href = href; }}
                  >
                    <td className="px-4 py-2">
                      <Link href={href} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="w-8 h-8 rounded border border-border-subtle bg-dark-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                          {s.icon && !s.icon.includes('placehold') ? (
                            <Image src={s.icon} alt={s.name} width={32} height={32} className="object-cover" />
                          ) : (
                            <span className="text-text-muted text-xs">?</span>
                          )}
                        </div>
                        <span className="text-text-primary hover:text-honor-gold transition-colors">{formatSpellName(s.name)}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <ClassBadges spell={s} />
                    </td>
                    <td className="px-3 py-2" style={{ color: s.schoolType ? SCHOOL_COLORS[s.schoolType] || SCHOOL_FALLBACK : undefined }}>
                      {s.schoolType || <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-text-secondary font-mono text-xs">{formatTime(s.cooldown)}</td>
                    <td className="px-3 py-2 text-text-secondary">{s.requiredResource || '—'}</td>
                    <td className="px-3 py-2 text-right text-text-secondary font-mono text-xs">{formatTime(s.castTime)}</td>
                    <td className="px-3 py-2 text-right text-text-secondary font-mono text-xs">{s.maxRange || '—'}</td>
                    <td className="px-3 py-2 text-text-muted text-xs">{s.targetType || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded text-sm bg-dark-surface text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">Page {page} of {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="px-3 py-1.5 rounded text-sm bg-dark-surface text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {hovered && (() => {
        const PANEL_W = 340;
        const PANEL_H_EST = 280;
        const margin = 14;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
        let left = mousePos.x + margin;
        let top = mousePos.y + margin;
        if (left + PANEL_W > vw - 8) left = mousePos.x - PANEL_W - margin;
        if (top + PANEL_H_EST > vh - 8) top = vh - PANEL_H_EST - 8;
        if (top < 8) top = 8;
        const schoolColor = hovered.schoolType ? SCHOOL_COLORS[hovered.schoolType] || SCHOOL_FALLBACK : null;
        return (
          <div
            className="fixed bg-card-bg border border-border-subtle rounded-lg p-3 shadow-xl z-50 pointer-events-none"
            style={{ left, top, width: PANEL_W }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="w-12 h-12 rounded border border-border-subtle bg-dark-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                {hovered.icon && !hovered.icon.includes('placehold') ? (
                  <Image src={hovered.icon} alt={hovered.name} width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-text-muted text-xs">?</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-heading text-honor-gold text-sm leading-tight">{formatSpellName(hovered.name)}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hovered.schoolType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface" style={{ color: schoolColor || undefined }}>{hovered.schoolType}</span>}
                  {hovered.requiredResource && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-text-secondary">{hovered.requiredResource}</span>}
                </div>
              </div>
            </div>
            {hovered.description && (
              <div className="text-xs text-text-secondary leading-relaxed mb-2">{formatSpellName(hovered.description)}</div>
            )}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-text-muted mb-2">
              <div className="flex justify-between"><span>Cast</span><span className="text-text-primary tabular-nums">{formatTime(hovered.castTime)}</span></div>
              <div className="flex justify-between"><span>Cooldown</span><span className="text-text-primary tabular-nums">{formatTime(hovered.cooldown)}</span></div>
              <div className="flex justify-between"><span>Range</span><span className="text-text-primary tabular-nums">{hovered.maxRange ?? '—'}</span></div>
              <div className="flex justify-between"><span>GCD</span><span className="text-text-primary tabular-nums">{formatTime(hovered.globalCooldown)}</span></div>
            </div>
            {hovered.targetType && (
              <div className="text-[11px] text-text-muted mb-2">
                <span className="opacity-70">Target: </span><span className="text-text-secondary">{hovered.targetType}</span>
              </div>
            )}
            {uniqueClasses(hovered).length > 0 && (
              <div className="text-[11px] mb-2">
                <span className="opacity-70 text-text-muted">Classes: </span>
                <ClassBadges spell={hovered} />
              </div>
            )}
            {hovered.flags && hovered.flags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-border-subtle/40">
                {hovered.flags.map((f) => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-text-muted">{f}</span>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
