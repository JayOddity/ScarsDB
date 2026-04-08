import Link from 'next/link';
import Image from 'next/image';
import { classes, allRaces } from '@/data/classes';

export const metadata = {
  title: 'Scars of Honor Classes: All 10 Playable Classes | ScarsHQ',
  description: 'All 10 playable classes in Scars of Honor. Warrior, Paladin, Mage, Priest, Ranger, Druid, Assassin, Necromancer, Pirate, and Mystic. No fixed subclasses — your talent tree defines your role.',
  openGraph: {
    title: 'Scars of Honor Classes: All 10 Playable Classes',
    description: 'All 10 playable classes in Scars of Honor. No fixed subclasses — your talent tree defines your role.',
    url: '/classes',
    siteName: 'ScarsHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Scars of Honor Classes: All 10 Playable Classes',
    description: 'All 10 playable classes in Scars of Honor. No fixed subclasses — your talent tree defines your role.',
  },
  alternates: {
    canonical: '/classes',
  },
};

export default function ClassesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Classes of Aragon</h1>
      <p className="text-text-secondary max-w-3xl mb-8">
        Scars of Honor features 10 playable classes with no fixed subclasses. Instead, each class
        has a massive talent tree with 240+ interconnected nodes. Your choices define your role
        and playstyle entirely.
      </p>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 mb-12">
        {classes.map((cls) => (
          <Link
            key={cls.slug}
            href={`/classes/${cls.slug}`}
            className="flex items-center gap-2 px-3 py-2 bg-card-bg border border-border-subtle rounded-lg hover:border-honor-gold-dim transition-colors text-sm"
          >
            <img src={cls.icon} alt={cls.name} className="w-6 h-6" />
            <span className="text-text-primary">{cls.name}</span>
          </Link>
        ))}
      </div>

      {/* Class cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {classes.map((cls) => {
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
        Source: <a href="https://www.scarsofhonor.com/classes" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/classes</a>
      </p>
    </div>
  );
}
