'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { classes } from '@/data/classes';

interface SearchResult {
  type: 'class' | 'page' | 'item';
  name: string;
  description: string;
  href: string;
  icon?: string;
}

const staticResults: SearchResult[] = [
  ...classes.map((cls) => ({
    type: 'class' as const,
    name: cls.name,
    description: `${cls.subtitle} - ${cls.subclasses.map((s) => s.name).join(', ')}`,
    href: `/classes/${cls.slug}`,
    icon: cls.icon,
  })),
  ...classes.map((cls) => ({
    type: 'page' as const,
    name: `${cls.name} Talent Tree`,
    description: `Build your ${cls.name} talents`,
    href: `/talents/${cls.slug}`,
    icon: cls.icon,
  })),
  { type: 'page', name: 'Item Database', description: 'Browse all 1,603 items', href: '/database' },
  { type: 'page', name: 'Gear Planner', description: 'Plan your loadout', href: '/gear' },
  { type: 'page', name: 'Playtest Info', description: 'Spring 2026 playtest details', href: '/playtest' },
  { type: 'page', name: 'Races & Factions', description: 'Sacred Order vs. Domination', href: '/races' },
  { type: 'page', name: 'All Classes', description: '10 playable classes overview', href: '/classes' },
  { type: 'page', name: 'Talent Calculator', description: 'Choose a class to build', href: '/talents' },
  { type: 'page', name: 'Articles', description: 'Guides, lore, and in-depth articles', href: '/articles' },
  { type: 'page', name: 'Info Pages', description: 'General information about the site', href: '/pages' },
  { type: 'page', name: 'Professions', description: 'Gathering and crafting professions', href: '/professions' },
  { type: 'page', name: 'Mounts', description: 'Ground mounts and how to obtain them', href: '/mounts' },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  // Search — local results render immediately; remote fetches debounced 220ms
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }

    const q = query.toLowerCase();
    const matched = staticResults.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );

    matched.push({
      type: 'item',
      name: `View all items matching "${query}"`,
      description: 'Open item database with this search',
      href: `/database?search=${encodeURIComponent(query)}`,
    });

    setResults(matched.slice(0, 10));
    setSelectedIdx(0);

    const controller = new AbortController();
    const signal = controller.signal;

    const timer = window.setTimeout(() => {
      Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal }).then((r) => r.json()).catch(() => ({ results: [] })),
        fetch(`/api/items?search=${encodeURIComponent(query)}&per_page=5`, { signal }).then((r) => r.json()).catch(() => ({ items: [] })),
      ]).then(([sanityData, itemData]) => {
        if (signal.aborted) return;
        setResults((prev) => {
          const existing = new Set(prev.map((r) => r.href));
          const newResults: SearchResult[] = [];

          if (sanityData.results?.length) {
            for (const r of sanityData.results) {
              if (!existing.has(r.href)) {
                newResults.push(r);
                existing.add(r.href);
              }
            }
          }

          if (itemData.items?.length) {
            for (const item of itemData.items) {
              const href = item.slug ? `/database/${item.slug}` : `/items/${item.id}`;
              if (!existing.has(href)) {
                newResults.push({
                  type: 'item',
                  name: item.name,
                  description: [item.rarity, item.type, item.slot_type].filter(Boolean).join(' · '),
                  href,
                });
                existing.add(href);
              }
            }
          }

          const viewAllLink = prev[prev.length - 1];
          return [...prev.slice(0, -1), ...newResults, viewAllLink].slice(0, 15);
        });
      });
    }, 220);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const navigate = useCallback((result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search input bar */}
      <div
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-[7px] min-w-[432px] bg-dark-surface border rounded-lg text-sm cursor-text transition-colors ${
          open ? 'border-honor-gold-dim' : 'border-border-subtle hover:border-honor-gold-dim'
        }`}
      >
        <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {open ? (
          <input
            ref={inputRef}
            type="text"
            placeholder="Type 3 characters to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
          />
        ) : (
          <span className="text-text-muted flex-1">Search</span>
        )}
        <kbd className="text-[10px] text-text-muted bg-void-black/50 px-1.5 py-0.5 rounded border border-border-subtle">
          Ctrl+K
        </kbd>
      </div>

      {/* Dropdown results */}
      {open && query.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-deep-night border border-border-subtle rounded-lg shadow-2xl overflow-hidden z-[100]">
          <div className="max-h-80 overflow-y-auto py-1">
            {results.map((result, i) => (
              <button
                key={`${result.href}-${result.name}`}
                onClick={() => navigate(result)}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIdx ? 'bg-dark-surface' : 'hover:bg-dark-surface/50'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {result.icon?.startsWith('/') ? (
                    <img src={result.icon} alt="" className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{result.icon || (result.type === 'item' ? '🔍' : '📄')}</span>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{result.name}</p>
                  <p className="text-xs text-text-muted truncate">{result.description}</p>
                </div>
                <span className="text-[10px] text-text-muted bg-dark-surface px-1.5 py-0.5 rounded capitalize flex-shrink-0">
                  {result.type}
                </span>
              </button>
            ))}
            {results.length === 0 && query.trim().length >= 3 && (
              <p className="px-4 py-6 text-sm text-text-muted text-center">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
