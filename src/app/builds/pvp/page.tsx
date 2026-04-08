import type { Metadata } from 'next';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

export const metadata: Metadata = {
  title: 'PvP Builds - Scars of Honor PvP Talent Builds | ScarsHQ',
  description: 'Top PvP builds for Scars of Honor. Arena and battleground talent builds for every class, rated by the community.',
};

export default function PvPBuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">PvP Builds</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        Talent builds optimized for player-versus-player combat. Whether you&apos;re duelling in
        Thallan&apos;s Ring, fighting for control in the Mourning Pass battleground, or hunting
        in the open world, these builds are designed to give you the edge in every engagement.
        Burst damage, survivability, and crowd control are key — find the setup that matches your playstyle.
      </p>

      <BuildTagPills />
      <FilteredBuildList initialTag="pvp" defaultSort="top" layout="grid" />
    </div>
  );
}
