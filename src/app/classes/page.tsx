import Link from 'next/link';
import Image from 'next/image';
import { classes, allRaces } from '@/data/classes';
import { PLAYABLE_CLASS_SLUGS } from '@/lib/classTalents';

export const metadata = {
  title: 'Scars of Honor Classes: 4 Playable in Spring 2026 Playtest | ScarsHQ',
  description: 'All 10 Scars of Honor classes. Druid, Mage, Paladin, and Ranger are playable in the Spring 2026 playtest, each with full ability lists on its own page. The other 6 classes are not in this test.',
  openGraph: {
    title: 'Scars of Honor Classes: 4 Playable, 6 Coming Later',
    description: 'Druid, Mage, Paladin, Ranger playable in the Spring 2026 playtest. Open each class for its full abilities and talent tree.',
    url: '/classes',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [{ url: '/images/og-classes.jpg', width: 1200, height: 630, alt: 'Scars of Honor playable classes' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Scars of Honor Classes: 4 Playable in Spring 2026 Playtest',
    description: 'Druid, Mage, Paladin, Ranger playable now. Open each class for its full abilities and talent tree.',
    images: ['/images/og-classes.jpg'],
  },
  alternates: {
    canonical: '/classes',
  },
};

export default function ClassesPage() {
  const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name));
  const playableSet = new Set<string>(PLAYABLE_CLASS_SLUGS);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Scars of Honor Classes',
    numberOfItems: classes.length,
    itemListElement: classes.map((cls, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cls.name,
      url: `https://scarshq.com/classes/${cls.slug}`,
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Classes of Aragon</h1>
      <p className="text-text-secondary max-w-3xl mb-3">
        Scars of Honor has 10 classes with no fixed subclasses. Each class has a talent tree of 190 to 210 nodes — your picks define the role.
      </p>
      <p className="text-text-secondary max-w-3xl mb-8">
        Four classes are playable in the Spring 2026 playtest (April 30 to May 11): <Link href="/classes/druid" className="text-honor-gold hover:text-honor-gold-light">Druid</Link>, <Link href="/classes/mage" className="text-honor-gold hover:text-honor-gold-light">Mage</Link>, <Link href="/classes/paladin" className="text-honor-gold hover:text-honor-gold-light">Paladin</Link>, and <Link href="/classes/ranger" className="text-honor-gold hover:text-honor-gold-light">Ranger</Link>. The other six are listed below for reference.
      </p>

      {/* Quick nav */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-12">
        {sortedClasses.map((cls) => (
          <Link
            key={cls.slug}
            href={`/classes/${cls.slug}`}
            className="flex flex-col items-center gap-1 px-2 py-2 bg-card-bg border border-border-subtle rounded-lg hover:border-honor-gold-dim transition-colors"
          >
            <img src={cls.icon} alt={cls.name} className="w-8 h-8" />
            <span className="text-text-primary text-[11px] leading-tight text-center">{cls.name}</span>
          </Link>
        ))}
      </div>

      {/* Class cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {sortedClasses.map((cls) => {
          const races = allRaces.filter((r) => r.availableClasses.includes(cls.slug));
          return (
            <Link
              key={cls.slug}
              href={`/classes/${cls.slug}`}
              id={cls.slug}
              className="bg-card-bg border border-border-subtle rounded-lg p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover group block"
            >
              {/* Icon + class name centered at top */}
              <div className="flex flex-col items-center mb-3">
                <img src={cls.icon} alt={cls.name} className="w-16 h-16 mb-1" />
                <h2 className="font-heading text-xl text-honor-gold">{cls.name}</h2>
                <span className="text-[10px] text-text-muted">{cls.subtitle}</span>
                {playableSet.has(cls.slug) ? (
                  <span className="mt-2 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-emerald-400/30 text-emerald-300 bg-emerald-500/10">Playtest playable</span>
                ) : (
                  <span className="mt-2 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-border-subtle text-text-muted bg-dark-surface/40">Not in current test</span>
                )}
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-3 line-clamp-3">
                {cls.description}{' '}
                <span className="text-honor-gold group-hover:text-honor-gold-light transition-colors">Read more →</span>
              </p>

              {/* Paths */}
              <div className="flex items-center gap-2 mb-3">
                {cls.subclasses.map((sub) => (
                  <span key={sub.name} className="text-sm px-4 py-2 rounded bg-dark-surface/50 text-honor-gold font-heading">{sub.name}</span>
                ))}
              </div>

              {/* Races */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">Races:</span>
                {races.map((race) => (
                  <Image key={race.slug} src={race.banner} alt={race.name} width={36} height={36} className="object-contain" title={race.name} />
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Source */}
      <p className="text-xs text-text-muted mt-8">
        Source: <a href="https://www.scarsofhonor.com/classes" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/classes</a>. Per-class ability lists on each individual class page are pulled from the Spring 2026 playtest client.
      </p>
    </div>
  );
}
