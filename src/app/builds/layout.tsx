import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor Builds - Talent Trees & Gear Setups | ScarsHQ',
  description:
    'Browse and share community talent builds for every Scars of Honor class. PvP, PvE, leveling, and beginner builds with votes and the community tier list.',
  alternates: { canonical: '/builds' },
};

export default function BuildsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
