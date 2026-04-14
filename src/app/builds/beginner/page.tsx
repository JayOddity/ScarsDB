import type { Metadata } from 'next';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

export const metadata: Metadata = {
  title: 'Beginner Builds - Scars of Honor New Player Guides | ScarsHQ',
  description: 'Beginner friendly builds for Scars of Honor. Simple, effective talent setups for new players learning each class.',
  alternates: { canonical: '/builds/beginner' },
};

export default function BeginnerBuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Beginner Guides</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        New to Scars of Honor? These builds are made for you. Beginner builds focus on simplicity
        and forgiveness — straightforward talent paths that are effective without requiring perfect
        rotation execution. Each build is designed to help you learn your class fundamentals while
        still being strong enough to handle all content.
      </p>

      <BuildTagPills />
      <FilteredBuildList initialTag="beginner" defaultSort="top" layout="grid" />
    </div>
  );
}
