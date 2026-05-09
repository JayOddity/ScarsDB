'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface QuestObjective {
  type: number;
  text: string;
  coords: [number, number, number] | null;
  radius: number | null;
  counter: number | null;
}

export interface Quest {
  id: number;
  title: string;
  slug: string;
  type: number;
  typeLabel: string;
  objectives: QuestObjective[];
}

interface Props {
  quests: Quest[];
  types: string[];
}

const TYPE_COLORS: Record<string, string> = {
  Main: '#e8c432',
  Side: '#9aa4b2',
  Special: '#c084fc',
  Other: '#9ca3af',
};

export default function QuestDatabase({ quests, types }: Props) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<Quest | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quests.filter((quest) => {
      if (typeFilter && quest.typeLabel !== typeFilter) return false;
      if (q) {
        const inTitle = quest.title.toLowerCase().includes(q);
        const inObj = quest.objectives.some((o) => o.text.toLowerCase().includes(q));
        if (!inTitle && !inObj) return false;
      }
      return true;
    });
  }, [quests, typeFilter, search]);

  const hasFilters = !!typeFilter || !!search;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Quest Database</h1>
      <p className="text-text-muted text-sm mb-6">
        Datamined from the Spring 2026 Playtest client. {quests.length} quest{quests.length === 1 ? '' : 's'} so far.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/database"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-surface text-text-muted hover:text-text-primary transition-all"
        >
          Items
        </Link>
        <Link
          href="/database/spells"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-surface text-text-muted hover:text-text-primary transition-all"
        >
          Spells
        </Link>
        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-honor-gold text-void-black">
          Quests
        </span>
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-lg p-4 sm:p-5 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !typeFilter ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-text-primary'
            }`}
          >
            All Quests
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === t ? 'bg-honor-gold text-void-black' : 'bg-dark-surface text-text-muted hover:text-text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by title or objective..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-dark-surface border border-border-subtle rounded-lg pl-3 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim"
          />
          {hasFilters && (
            <button
              onClick={() => { setTypeFilter(null); setSearch(''); }}
              className="px-3 py-2 rounded-lg text-sm bg-dark-surface text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-text-muted py-12">No quests match your filters.</div>
      ) : (
        <div className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dark-surface text-text-muted text-xs uppercase tracking-wider select-none">
                <th className="px-4 py-3 text-left">Quest</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Type</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Objectives</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const href = `/database/quests/${q.slug}`;
                return (
                  <tr
                    key={q.id}
                    className="border-t border-border-subtle/40 hover:bg-dark-surface/40 transition-colors cursor-pointer"
                    onMouseEnter={() => setHovered(q)}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { window.location.href = href; }}
                  >
                    <td className="px-4 py-3">
                      <Link href={href} className="text-text-primary hover:text-honor-gold transition-colors" onClick={(e) => e.stopPropagation()}>
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3" style={{ color: TYPE_COLORS[q.typeLabel] || TYPE_COLORS.Other }}>
                      {q.typeLabel}
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary tabular-nums">{q.objectives.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hovered && (() => {
        const PANEL_W = 360;
        const PANEL_H_EST = 320;
        const margin = 14;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
        let left = mousePos.x + margin;
        let top = mousePos.y + margin;
        if (left + PANEL_W > vw - 8) left = mousePos.x - PANEL_W - margin;
        if (top + PANEL_H_EST > vh - 8) top = vh - PANEL_H_EST - 8;
        if (top < 8) top = 8;
        const typeColor = TYPE_COLORS[hovered.typeLabel] || TYPE_COLORS.Other;
        const preview = hovered.objectives.slice(0, 4);
        return (
          <div
            className="fixed bg-card-bg border border-border-subtle rounded-lg p-3 shadow-xl z-50 pointer-events-none"
            style={{ left, top, width: PANEL_W }}
          >
            <div className="font-heading text-honor-gold text-sm leading-tight mb-1">{hovered.title}</div>
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: typeColor }}>
              {hovered.typeLabel} Quest · {hovered.objectives.length} objectives
            </div>
            <ol className="space-y-1 text-xs text-text-secondary">
              {preview.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-text-muted tabular-nums">{i + 1}.</span>
                  <span>{o.text}{o.counter ? ` (×${o.counter})` : ''}</span>
                </li>
              ))}
              {hovered.objectives.length > preview.length && (
                <li className="text-text-muted text-[11px] italic">…and {hovered.objectives.length - preview.length} more</li>
              )}
            </ol>
          </div>
        );
      })()}
    </div>
  );
}
