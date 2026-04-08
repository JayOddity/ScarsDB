'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tags = [
  { label: 'All', href: '/builds' },
  { label: 'Best Builds', href: '/builds/best' },
  { label: 'PvP', href: '/builds/pvp' },
  { label: 'PvE', href: '/builds/pve' },
  { label: 'Leveling', href: '/builds/leveling' },
  { label: 'Beginner', href: '/builds/beginner' },
];

export default function BuildTagPills() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag) => {
        const isActive = pathname === tag.href;
        return (
          <Link
            key={tag.href}
            href={tag.href}
            className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
              isActive
                ? 'border-honor-gold bg-honor-gold text-void-black'
                : 'border-border-subtle bg-card-bg text-text-secondary hover:border-honor-gold-dim hover:text-honor-gold'
            }`}
          >
            {tag.label}
          </Link>
        );
      })}
    </div>
  );
}
