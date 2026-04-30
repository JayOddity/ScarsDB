import Link from 'next/link';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { classes } from '@/data/classes';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import TalentsHubRedirect from './TalentsHubRedirect';

export const metadata: Metadata = {
  title: 'Scars of Honor Talent Tree — Calculator & Build Planner | ScarsHQ',
  description:
    'Plan your Scars of Honor talent tree with the ScarsHQ calculator. 240+ nodes per class across all 10 classes — Warrior, Paladin, Ranger, Assassin, Pirate, Mage, Priest, Druid, Necromancer, Mystic. Save, share, and import builds.',
  openGraph: {
    title: 'Scars of Honor Talent Tree — Calculator & Build Planner',
    description:
      'Plan your Scars of Honor talent tree with the ScarsHQ calculator. 240+ nodes per class across all 10 classes. Save, share, and import builds.',
    url: '/talents',
    siteName: 'ScarsHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Talent Tree — Calculator & Build Planner',
    description:
      'Plan your Scars of Honor talent tree with the ScarsHQ calculator. 240+ nodes per class. Save and share builds.',
  },
  alternates: { canonical: '/talents' },
};

const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name));

export default async function TalentsHubPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = typeof sp.tab === 'string' ? sp.tab : undefined;
  const cookieStore = await cookies();
  const lastClassCookie = cookieStore.get('scarshq-last-class')?.value;
  const lastClass = lastClassCookie && classes.some((c) => c.slug === lastClassCookie) ? lastClassCookie : null;

  if (tab === 'Equipment' || tab === 'Scars') {
    redirect(`/talents/${lastClass ?? 'mage'}?tab=${encodeURIComponent(tab)}`);
  }
  if (lastClass) {
    redirect(`/talents/${lastClass}`);
  }
  // First-time visitor (no cookie, no tab): default to Mage so they see real
  // datamined content rather than an empty Warrior stub.
  redirect('/talents/mage');
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <Suspense fallback={null}>
        <TalentsHubRedirect />
      </Suspense>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Talent Calculator', url: '/talents' },
        ]}
      />

      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-3">
          Scars of Honor Talent Tree
        </h1>
        <p className="text-text-secondary text-base max-w-2xl mx-auto">
          Pick a class to open the calculator. Allocate up to 70 points across the tree, save your build, and share it with a 6-character code.
        </p>
      </div>

      <div className="max-w-5xl mx-auto py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {sortedClasses.map((c) => (
            <Link
              key={c.slug}
              href={`/talents/${c.slug}`}
              className="group flex flex-col items-center bg-card-bg border border-border-subtle rounded-lg p-4 hover:border-honor-gold-dim transition-colors"
            >
              <img src={c.icon} alt={`${c.name} class icon`} className="w-14 h-14 mb-2 group-hover:scale-105 transition-transform" />
              <span className="font-heading text-sm text-text-primary group-hover:text-honor-gold">{c.name}</span>
              <span className="text-[10px] text-text-muted text-center mt-0.5">{c.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto mt-10">
        <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
          <h2 className="font-heading text-honor-gold text-base mb-2">How talent trees work</h2>
          <p className="text-sm text-text-secondary">
            Each class has 6 starting nodes around a central hub. Choose up to 2 starting paths, then spend 70 talent points on connected nodes. Most nodes have 3 ranks; active nodes unlock new abilities.
          </p>
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
          <h2 className="font-heading text-honor-gold text-base mb-2">Save and share builds</h2>
          <p className="text-sm text-text-secondary">
            Save a build to get a 6-character import code. Anyone can paste the code into the calculator to load your talent and equipment loadout. Logged-in users can attach a name, tags, and full markdown guide.
          </p>
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
          <h2 className="font-heading text-honor-gold text-base mb-2">Data status</h2>
          <p className="text-sm text-text-secondary">
            Node icons and exact talent effects come from in-game data once Beastburst exposes them. Today the layout is procedural at 175 nodes per class. Browse <Link href="/builds" className="text-honor-gold hover:text-honor-gold-light">community builds</Link> to see how others spend their points.
          </p>
        </div>
      </div>
    </div>
  );
}
