'use client';

import Link from 'next/link';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Character',
    items: [
      { name: 'Classes', href: '/classes' },
      { name: 'Races & Factions', href: '/races' },
    ],
  },
  {
    label: 'Items',
    items: [
      { name: 'Item Database', href: '/items' },
      { name: 'Professions', href: '/professions' },
      { name: 'Mounts', href: '/mounts' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Talent Calculator', href: '/talents' },
      { name: 'Gear Planner', href: '/gear' },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'News', href: '/news' },
      { name: 'Articles', href: '/articles' },
      { name: 'Dev Tracker', href: '/tracker' },
      { name: 'Playtest', href: '/playtest' },
      { name: 'Info', href: '/pages' },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function openSearch() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  }

  return (
    <header className="sticky top-0 z-50 bg-void-black/95 backdrop-blur border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-honor-gold rounded flex items-center justify-center text-void-black font-bold font-heading text-sm">
              SD
            </div>
            <span className="font-heading text-lg text-honor-gold group-hover:text-honor-gold-light transition-colors hidden sm:inline">
              ScarsDB
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(group.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="px-3 py-2 text-sm text-text-secondary hover:text-honor-gold transition-colors font-medium">
                  {group.label}
                </button>
                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-deep-night border border-border-subtle rounded-lg shadow-xl py-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-honor-gold hover:bg-dark-surface transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search & Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface border border-border-subtle rounded-lg text-sm text-text-muted hover:text-text-secondary hover:border-honor-gold-dim transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-[10px] bg-void-black px-1 py-0.5 rounded border border-border-subtle">⌘K</kbd>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-honor-gold"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-deep-night border-t border-border-subtle">
          {navGroups.map((group) => (
            <div key={group.label} className="border-b border-border-subtle">
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-2 text-sm text-text-secondary hover:text-honor-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
