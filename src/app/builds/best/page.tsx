import type { Metadata } from 'next';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

export const metadata: Metadata = {
  title: 'Best Scars of Honor Builds - Top Rated Builds | ScarsHQ',
  description: 'The highest rated Scars of Honor builds voted by the community. Find the best talent builds for every class, updated for the latest patch.',
  alternates: { canonical: '/builds/best' },
};

export default function BestBuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Best Builds</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        The community&apos;s highest rated talent builds across all classes. These builds have been
        tested and voted on by ScarsHQ users — whether you&apos;re looking for a proven PvP setup,
        a reliable PvE rotation, or a fast leveling path, start here.
      </p>
      <BuildTagPills />
      <FilteredBuildList defaultSort="top" layout="grid" />
    </div>
  );
}
