import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor Builds — Best Talent Trees for Every Class | ScarsHQ',
  description:
    'Find the best Scars of Honor builds, voted by the community. PvP, PvE, leveling, and beginner builds for all 10 classes. Free build planner, talent calculator, and tier list.',
  alternates: { canonical: '/builds' },
};

export default function BuildsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
