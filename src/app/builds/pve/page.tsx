import type { Metadata } from 'next';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

export const metadata: Metadata = {
  title: 'PvE Builds - Scars of Honor Dungeon & Raid Builds | ScarsHQ',
  description: 'Top PvE builds for Scars of Honor. Dungeon, raid, and open world PvE talent builds for every class, rated by the community.',
};

export default function PvEBuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">PvE Builds</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        Talent builds built for dungeons, world bosses, and group content. PvE in Scars of Honor
        demands smart talent allocation — you&apos;ll need sustained damage, healing throughput, or
        tanking survivability depending on your role. These builds have been tested in the Crypt
        of the Fallen and open world encounters, and rated by the community.
      </p>

      <BuildTagPills />
      <FilteredBuildList initialTag="pve" defaultSort="top" layout="grid" />
    </div>
  );
}
