'use client';

import { useState, useEffect, useRef } from 'react';
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
    description: `${cls.role} — ${cls.subclasses.map((s) => s.name).join(', ')}`,
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
  { type: 'page', name: 'Item Database', description: 'Browse all 1,603 items', href: '/items' },
  { type: 'page', name: 'Gear Planner', description: 'Plan your loadout', href: '/gear' },
  { type: 'page', name: 'Dev Tracker', description: 'Latest developer updates', href: '/tracker' },
  { type: 'page', name: 'Playtest Info', description: 'Spring 2026 playtest details', href: '/playtest' },
  { type: 'page', name: 'Races & Factions', description: 'Sacred Order vs. Domination', href: '/races' },
  { type: 'page', name: 'All Classes', description: '10 playable classes overview', href: '/classes' },
  { type: 'page', name: 'Talent Calculator', description: 'Choose a class to build', href: '/talents' },
  { type: 'page', name: 'News', description: 'Latest Scars of Honor news', href: '/news' },
  { type: 'page', name: 'Articles', description: 'Guides, lore, and in-depth articles', href: '/articles' },
  { type: 'page', name: 'Info Pages', description: 'General information about the site', href: '/pages' },
  { type: 'page', name: 'Professions', description: 'Gathering and crafting professions', href: '/professions' },
  { type: 'page', name: 'Mounts', description: 'Ground and flying mounts', href: '/mounts' },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(staticResults.slice(0, 8));
      setSelectedIdx(0);
    }
  }, [open]);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults(staticResults.slice(0, 8));
      setSelectedIdx(0);
      return;
    }

    const q = query.toLowerCase();
    const matched = staticResults.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );

    // Also add a "Search items for..." option
    matched.push({
      type: 'item',
      name: `Search items for "${query}"`,
      description: 'Search the item database',
      href: `/items`,
    });

    setResults(matched.slice(0, 10));
    setSelectedIdx(0);

    // Also search Sanity for articles/news/pages
    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { results: SearchResult[] }) => {
        if (data.results?.length) {
          setResults((prev) => {
            const existing = new Set(prev.map((r) => r.href));
            const newResults = data.results.filter((r: SearchResult) => !existing.has(r.href));
            return [...prev.slice(0, -1), ...newResults, prev[prev.length - 1]].slice(0, 12);
          });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  function navigate(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative max-w-xl mx-auto mt-[15vh] px-4">
        <div className="bg-deep-night border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
            <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search classes, items, tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
            />
            <kbd className="text-[10px] text-text-muted bg-dark-surface px-1.5 py-0.5 rounded border border-border-subtle">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((result, i) => (
              <button
                key={`${result.href}-${result.name}`}
                onClick={() => navigate(result)}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIdx ? 'bg-dark-surface' : 'hover:bg-dark-surface/50'
                }`}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">
                  {result.icon || (result.type === 'item' ? '🔍' : '📄')}
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
            {results.length === 0 && (
              <p className="px-4 py-6 text-sm text-text-muted text-center">No results found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
