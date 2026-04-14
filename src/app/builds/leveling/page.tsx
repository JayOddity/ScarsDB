import type { Metadata } from 'next';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

export const metadata: Metadata = {
  title: 'Leveling Builds - Scars of Honor Fast Leveling Guides | ScarsHQ',
  description: 'The fastest leveling builds for Scars of Honor. Efficient talent setups for every class to reach endgame quickly.',
  alternates: { canonical: '/builds/leveling' },
};

export default function LevelingBuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Leveling Builds</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        Talent builds designed to get you to endgame as fast as possible. Leveling in Scars of Honor
        is about maximizing AoE damage, survivability, and movement efficiency. These builds
        prioritize kill speed and sustain over min-maxed endgame performance — you can always
        respec once you hit cap.
      </p>

      <BuildTagPills />
      <FilteredBuildList initialTag="leveling" defaultSort="top" layout="grid" />
    </div>
  );
}
