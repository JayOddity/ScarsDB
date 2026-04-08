'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession, signIn, signOut } from 'next-auth/react';
import GlobalSearch from './GlobalSearch';
import { classes } from '@/data/classes';

interface HeaderProps {
  siteName: string;
  siteAbbrev: string;
}

interface SubMenuItem {
  name: string;
  href: string;
  icon?: string;
}

interface NavDropdownItem {
  name: string;
  href: string;
  children?: SubMenuItem[];
}

interface NavItem {
  label: string;
  href?: string;
  items?: NavDropdownItem[];
}

const classChildren = (prefix: string): SubMenuItem[] =>
  classes.map((c) => ({ name: c.name, href: `${prefix}/${c.slug}`, icon: c.icon }));

const navItems: NavItem[] = [
  {
    label: 'Database',
    href: '/items',
    items: [
      { name: 'All Items', href: '/items' },
      { name: 'Weapons', href: '/items?cat=weapons' },
      { name: 'Armor', href: '/items?cat=armor' },
      { name: 'Accessories', href: '/items?cat=accessories' },
      { name: 'Tools', href: '/items?cat=tools' },
      { name: 'Consumables', href: '/items?cat=consumables' },
      { name: 'Materials', href: '/items?cat=materials' },
    ],
  },
  {
    label: 'Character',
    href: '/character',
    items: [
      { name: 'Classes', href: '/classes', children: classChildren('/classes') },
      {
        name: 'Races', href: '/races',
        children: [
          { name: 'Human', href: '/races/human' },
          { name: 'Sun Elf', href: '/races/sun-elf' },
          { name: 'Dwarf', href: '/races/dwarf' },
          { name: 'Bearan', href: '/races/bearan' },
          { name: 'Orc', href: '/races/orc' },
          { name: 'Infernal Demon', href: '/races/infernal-demon' },
          { name: 'Undead', href: '/races/undead' },
          { name: 'Gronthar', href: '/races/gronthar' },
        ],
      },
      { name: 'Factions', href: '/factions' },
      { name: 'Scars', href: '/scars' },
    ],
  },
  {
    label: 'Professions',
    href: '/professions',
    items: [
      {
        name: 'Gathering', href: '/professions',
        children: [
          { name: 'Mining', href: '/professions#mining' },
          { name: 'Woodcutting', href: '/professions#woodcutting' },
          { name: 'Herbalism', href: '/professions#herbalism' },
          { name: 'Fishing', href: '/professions#fishing' },
        ],
      },
      {
        name: 'Crafting', href: '/professions',
        children: [
          { name: 'Blacksmithing', href: '/professions#blacksmithing' },
          { name: 'Cooking', href: '/professions#cooking' },
          { name: 'Alchemy', href: '/professions#alchemy' },
          { name: 'Enchanting', href: '/professions#enchanting' },
        ],
      },
    ],
  },
  {
    label: 'Gameplay',
    href: '/gameplay',
    items: [
      { name: 'PvE Content', href: '/pve' },
      { name: 'PvP Content', href: '/pvp' },
      { name: 'Mounts', href: '/mounts' },
      { name: 'Skills & Abilities', href: '/skills' },
      { name: 'Cosmetics', href: '/cosmetics' },
      { name: 'Maps & Zones', href: '/maps' },
    ],
  },
  {
    label: 'FAQs',
    items: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Release Date', href: '/scars-of-honor-release-date' },
      { name: 'Playtest', href: '/playtest' },
      { name: 'Free to Play', href: '/free-to-play' },
      { name: 'Download', href: '/download' },
      { name: 'Platforms & Mobile', href: '/mobile' },
      { name: 'System Requirements', href: '/system-requirements' },
      { name: 'Community', href: '/community' },
    ],
  },
  {
    label: 'Builds',
    href: '/builds',
    items: [
      { name: 'Best Builds', href: '/builds/best', children: classChildren('/builds') },
      { name: 'PvP Builds', href: '/builds/pvp', children: classChildren('/builds') },
      { name: 'PvE Builds', href: '/builds/pve', children: classChildren('/builds') },
      { name: 'Leveling Builds', href: '/builds/leveling', children: classChildren('/builds/leveling') },
      { name: 'Beginner Guides', href: '/builds/beginner', children: classChildren('/builds/beginner') },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Talent Calculator', href: '/talents' },
      { name: 'Gear Planner', href: '/talents?tab=Equipment' },
      { name: 'Scars', href: '/talents?tab=Scars' },
    ],
  },
  { label: 'Talent Calculator', href: '/talents' },
];

export default function Header({ siteName, siteAbbrev }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const { data: session } = useSession();

  return (
    <>
    <header className="sticky top-0 z-50 bg-void-black/95 backdrop-blur">
      {/* Top bar: Logo, Auth, Search */}
      <div className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-12 gap-4">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <img src="/Icons/scars-hq-logo.webp" alt={siteName} className="h-9 hover:brightness-110 transition-all" />
            </Link>

            <div className="flex items-center gap-3 ml-auto shrink-0">
              {/* Auth */}
              {session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-honor-gold-dim transition-all"
                  >
                    {session.user.image ? (
                      <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-honor-gold/20 flex items-center justify-center text-honor-gold text-xs font-bold">
                        {(session.user.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-deep-night border border-border-subtle rounded-lg shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-border-subtle">
                          <p className="text-sm text-text-primary font-medium truncate">{session.user.name}</p>
                          <p className="text-[10px] text-text-muted capitalize">{(session.user as unknown as Record<string, string>).provider}</p>
                        </div>
                        <Link href="/builds?tab=mine" className="block px-4 py-2 text-sm text-text-secondary hover:text-honor-gold hover:bg-dark-surface transition-colors" onClick={() => setShowUserMenu(false)}>
                          My Builds
                        </Link>
                        <button
                          onClick={() => { setShowUserMenu(false); signOut(); }}
                          className="w-full text-left px-4 py-2 text-sm text-scar-red-light hover:bg-dark-surface transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignIn(true)}
                  className="hidden sm:inline-flex px-3 py-1 bg-honor-gold/10 border border-honor-gold-dim rounded-lg text-xs text-honor-gold hover:bg-honor-gold/20 transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Search */}
              <div className="hidden md:block">
                <GlobalSearch />
              </div>

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
      </div>

      {/* Bottom bar: Navigation */}
      <div className="border-b border-border-subtle hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between">
            {navItems.map((nav) =>
              !nav.items ? (
                <Link
                  key={nav.label}
                  href={nav.href!}
                  className="px-2 py-2 text-lg text-text-secondary hover:text-honor-gold hover:bg-honor-gold/10 rounded transition-colors font-medium whitespace-nowrap"
                >
                  {nav.label}
                </Link>
              ) : (
                <div
                  key={nav.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(nav.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {nav.href ? (
                    <Link
                      href={nav.href}
                      className="px-2 py-2 text-lg text-text-secondary hover:text-honor-gold hover:bg-honor-gold/10 rounded transition-colors font-medium whitespace-nowrap inline-flex items-center gap-1"
                    >
                      {nav.label}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                  ) : (
                    <button className="px-2 py-2 text-lg text-text-secondary hover:text-honor-gold hover:bg-honor-gold/10 rounded transition-colors font-medium whitespace-nowrap inline-flex items-center gap-1">
                      {nav.label}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  {openDropdown === nav.label && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-deep-night border border-border-subtle rounded-lg shadow-xl py-2">
                      {nav.items.map((item) => (
                        <div
                          key={item.name}
                          className="relative"
                          onMouseEnter={() => setHoveredItem(item.children ? item.name : null)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center justify-between px-4 py-2 text-sm text-text-secondary hover:text-honor-gold hover:bg-dark-surface transition-colors"
                          >
                            {item.name}
                            {item.children && (
                              <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                          {item.children && hoveredItem === item.name && (
                            <div className="absolute left-full top-0 ml-0 w-44 bg-deep-night border border-border-subtle rounded-lg shadow-xl py-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="flex items-center gap-2 px-4 py-1.5 text-sm text-text-secondary hover:text-honor-gold hover:bg-dark-surface transition-colors"
                                >
                                  {child.icon && <img src={child.icon} alt="" className="w-5 h-5 object-contain" />}
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-deep-night border-t border-border-subtle">
          {navItems.map((nav) =>
            nav.href && !nav.items ? (
              <Link
                key={nav.label}
                href={nav.href}
                className="block px-4 py-2 text-sm text-text-secondary hover:text-honor-gold border-b border-border-subtle"
                onClick={() => setMobileOpen(false)}
              >
                {nav.label}
              </Link>
            ) : (
              <div key={nav.label} className="border-b border-border-subtle">
                {nav.href ? (
                  <Link href={nav.href} className="block px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-honor-gold" onClick={() => setMobileOpen(false)}>
                    {nav.label}
                  </Link>
                ) : (
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {nav.label}
                  </div>
                )}
                {nav.items?.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-6 py-2 text-sm text-text-secondary hover:text-honor-gold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )
          )}
          {!session?.user && (
            <button
              onClick={() => { setMobileOpen(false); setShowSignIn(true); }}
              className="block w-full text-left px-4 py-3 text-sm text-honor-gold font-medium border-t border-border-subtle"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>

      {/* Sign In Modal - portaled to body so sticky header doesn't clip it */}
      {showSignIn && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSignIn(false)}>
          <div className="bg-deep-night border border-border-subtle rounded-lg p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-xl text-honor-gold mb-2 text-center">Sign In</h3>
            <p className="text-text-muted text-xs text-center mb-6">Sign in to save builds and share with the community.</p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowSignIn(false); signIn('google', { callbackUrl: window.location.href }); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                onClick={() => { setShowSignIn(false); signIn('discord', { callbackUrl: window.location.href }); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] text-white font-medium rounded-lg hover:bg-[#4752C4] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Continue with Discord
              </button>
            </div>
            <p className="text-center text-[10px] text-text-muted mt-4">No password needed. We only use your name and avatar.</p>
            <button onClick={() => setShowSignIn(false)} className="mt-3 w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">Cancel</button>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}

// Export for other components to trigger sign-in modal
export { signIn } from 'next-auth/react';
