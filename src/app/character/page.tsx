import Link from 'next/link';
import { classes, factions, allRaces } from '@/data/classes';

export const metadata = {
  title: 'Character Guide - ScarsHQ',
  description: 'A character overview for Scars of Honor covering classes, races, factions, and the Scars system in one page.',
  alternates: {
    canonical: '/character',
  },
};

const scarsHighlights = [
  'Permanent progression that cannot be respecced away like talents or swapped like gear.',
  'Earned through milestones and achievements across PvE, PvP, exploration, and other content.',
  'Adds long-term identity on top of your class, race, and talent choices.',
];

export default function CharacterPage() {
  const sacredOrderCount = factions.sacredOrder.races.length;
  const dominationCount = factions.domination.races.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <section className="relative overflow-hidden rounded-2xl border border-honor-gold/20 bg-[radial-gradient(circle_at_top,rgba(200,168,78,0.18),transparent_42%),linear-gradient(180deg,rgba(22,22,42,0.96),rgba(10,10,15,0.98))] p-8 md:p-10 mb-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-honor-gold/75 mb-3">Character Overview</p>
          <h1 className="font-heading text-4xl md:text-5xl text-honor-gold mb-4">Build Your Character in Scars of Honor</h1>
          <p className="text-text-secondary leading-relaxed mb-6">
            Your character identity comes from four connected layers: class, race, faction, and the
            permanent Scars system. This page is the short version of everything under the Character menu.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border-subtle bg-void-black/30 px-4 py-3">
              <div className="text-2xl font-heading text-honor-gold">{classes.length}</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Classes</div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-void-black/30 px-4 py-3">
              <div className="text-2xl font-heading text-honor-gold">{allRaces.length}</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Races</div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-void-black/30 px-4 py-3">
              <div className="text-2xl font-heading text-honor-gold">2</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Factions</div>
            </div>
            <div className="rounded-lg border border-border-subtle bg-void-black/30 px-4 py-3">
              <div className="text-2xl font-heading text-honor-gold">1</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Scars System</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-12">
        <Link
          href="/classes"
          className="group rounded-2xl border border-border-subtle bg-card-bg p-6 hover:border-honor-gold-dim transition-colors"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Classes</p>
              <h2 className="font-heading text-2xl text-honor-gold">Choose a Combat Style</h2>
            </div>
            <span className="text-sm text-honor-gold/70 group-hover:text-honor-gold transition-colors">View classes</span>
          </div>
          <p className="text-text-secondary mb-5 leading-relaxed">
            Scars of Honor has 10 playable classes. There are no locked subclasses in the traditional MMO sense;
            your talent tree choices define your role, with each class offering three clear archetype directions.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {classes.slice(0, 6).map((gameClass) => (
              <div key={gameClass.slug} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-dark-surface/40 px-4 py-3">
                <img src={gameClass.icon} alt={gameClass.name} className="w-10 h-10 object-contain shrink-0" />
                <div>
                  <div className="text-sm font-medium text-text-primary">{gameClass.name}</div>
                  <div className="text-xs text-text-muted mb-1">{gameClass.subtitle}</div>
                  <div className="text-xs text-honor-gold/80">{gameClass.subclasses.map((subclass) => subclass.name).join(' / ')}</div>
                </div>
              </div>
            ))}
          </div>
        </Link>

        <Link
          href="/scars"
          className="group rounded-2xl border border-honor-gold/20 bg-[linear-gradient(180deg,rgba(200,168,78,0.08),rgba(22,22,42,0.96))] p-6 hover:border-honor-gold-dim transition-colors"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Scars</p>
          <h2 className="font-heading text-2xl text-honor-gold mb-4">Permanent Character Identity</h2>
          <p className="text-text-secondary leading-relaxed mb-5">
            Scars are the layer that sits beyond class and race. They are permanent marks earned through play and
            help make two characters with similar builds feel different over the long term.
          </p>
          <div className="space-y-3">
            {scarsHighlights.map((highlight) => (
              <div key={highlight} className="flex gap-3 rounded-lg border border-border-subtle bg-void-black/25 px-4 py-3">
                <span className="mt-1 h-2.5 w-2.5 rotate-45 bg-honor-gold shrink-0" />
                <p className="text-sm text-text-secondary">{highlight}</p>
              </div>
            ))}
          </div>
        </Link>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Races</p>
            <h2 className="font-heading text-2xl text-honor-gold">Eight Races Across Two Sides of the War</h2>
          </div>
          <Link href="/races" className="text-sm text-honor-gold/70 hover:text-honor-gold transition-colors">
            View races
          </Link>
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed mb-6">
          Your race determines your faction allegiance and class availability. The Sacred Order and the Domination
          each field four races with distinct histories, aesthetics, and gameplay combinations.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { faction: factions.sacredOrder, accent: 'border-honor-gold/20', text: 'text-honor-gold', hover: 'hover:border-honor-gold/40' },
            { faction: factions.domination, accent: 'border-scar-red/20', text: 'text-scar-red-light', hover: 'hover:border-scar-red/40' },
          ].map(({ faction, accent, text, hover }) => (
            <div key={faction.name} className={`rounded-2xl border ${accent} ${hover} bg-card-bg p-6 transition-colors`}>
              <div className="flex items-center gap-3 mb-4">
                <img src={faction.icon} alt={faction.name} className="w-10 h-10 rounded" />
                <div>
                  <h3 className={`font-heading text-2xl ${text}`}>{faction.name}</h3>
                  <p className="text-xs text-text-muted">{faction.summary}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {faction.races.map((race) => (
                  <Link
                    key={race.slug}
                    href={`/races/${race.slug}`}
                    className="rounded-lg border border-border-subtle bg-dark-surface/40 p-3 hover:border-honor-gold-dim transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img src={race.banner} alt={race.name} className="w-10 h-10 object-contain shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{race.name}</div>
                        <div className="text-[11px] text-text-muted">{race.tagline}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-text-muted line-clamp-2">{race.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Factions</p>
            <h2 className="font-heading text-2xl text-honor-gold">The War That Frames Every Character</h2>
          </div>
          <Link href="/factions" className="text-sm text-honor-gold/70 hover:text-honor-gold transition-colors">
            View factions
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-honor-gold/15 bg-dark-surface/35 p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src={factions.sacredOrder.icon} alt={factions.sacredOrder.name} className="w-10 h-10 rounded" />
              <div>
                <h3 className="font-heading text-xl text-honor-gold">{factions.sacredOrder.name}</h3>
                <p className="text-xs text-text-muted">{sacredOrderCount} races</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{factions.sacredOrder.summary}</p>
          </div>
          <div className="rounded-xl border border-scar-red/15 bg-dark-surface/35 p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src={factions.domination.icon} alt={factions.domination.name} className="w-10 h-10 rounded" />
              <div>
                <h3 className="font-heading text-xl text-scar-red-light">{factions.domination.name}</h3>
                <p className="text-xs text-text-muted">{dominationCount} races</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{factions.domination.summary}</p>
          </div>
        </div>
        <div className="diamond-divider my-8">
          <span className="diamond" />
        </div>
        <p className="text-text-secondary leading-relaxed max-w-4xl">
          In practice, the Character menu breaks down like this: class gives you your combat toolkit, race determines
          your origin and available class combinations, faction places you in the larger conflict, and Scars add the
          permanent decisions that separate your version of a build from everyone else&apos;s.
        </p>
      </section>
    </div>
  );
}
