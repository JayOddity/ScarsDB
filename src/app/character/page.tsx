import Link from 'next/link';
import { classes, factions, allRaces } from '@/data/classes';

export const metadata = {
  title: 'Character Overview - ScarsHQ',
  description: '10 classes, 8 races, 2 factions, and the Scars system. How character creation works in Scars of Honor.',
  alternates: {
    canonical: '/character',
  },
};

export default function CharacterPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-honor-gold/20 bg-[radial-gradient(circle_at_top,rgba(200,168,78,0.18),transparent_42%),linear-gradient(180deg,rgba(22,22,42,0.96),rgba(10,10,15,0.98))] p-8 md:p-10 mb-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-honor-gold/75 mb-3">Character Overview</p>
          <h1 className="font-heading text-4xl md:text-5xl text-honor-gold mb-4">Class, Race, Faction, Scars</h1>
          <p className="text-text-secondary leading-relaxed mb-6">
            You pick a race, which locks your faction and limits your class options.
            You pick a class, which gives you a 240+ node talent tree with no subclass lock.
            Then you earn Scars through gameplay, which are permanent and cannot be undone.
            That is the full character system.
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
              <div className="text-2xl font-heading text-honor-gold">240+</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Talent Nodes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes + Scars side by side */}
      <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-12">
        <Link
          href="/classes"
          className="group rounded-2xl border border-border-subtle bg-card-bg p-6 hover:border-honor-gold-dim transition-colors"
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Classes</p>
              <h2 className="font-heading text-2xl text-honor-gold">10 Classes, No Subclass Lock</h2>
            </div>
            <span className="text-sm text-honor-gold/70 group-hover:text-honor-gold transition-colors">View all</span>
          </div>
          <p className="text-text-secondary mb-5 leading-relaxed">
            Each class has three talent paths but you are never locked into one. Spend points across all three
            to create hybrid builds, or go deep into a single path. The talent tree replaces the traditional subclass system entirely.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {classes.slice(0, 6).map((gameClass) => (
              <div key={gameClass.slug} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-dark-surface/40 px-4 py-3">
                <img src={gameClass.icon} alt={gameClass.name} className="w-10 h-10 object-contain shrink-0" />
                <div>
                  <div className="text-sm font-medium text-text-primary">{gameClass.name}</div>
                  <div className="text-xs text-text-muted mb-1">{gameClass.subtitle}</div>
                  <div className="text-xs text-honor-gold/80">{gameClass.subclasses.map((s) => s.name).join(' / ')}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3">+ {classes.length - 6} more classes</p>
        </Link>

        <Link
          href="/scars"
          className="group rounded-2xl border border-honor-gold/20 bg-[linear-gradient(180deg,rgba(200,168,78,0.08),rgba(22,22,42,0.96))] p-6 hover:border-honor-gold-dim transition-colors"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">The Scars System</p>
          <h2 className="font-heading text-2xl text-honor-gold mb-4">Permanent Marks, Permanent Identity</h2>
          <p className="text-text-secondary leading-relaxed mb-5">
            Scars are the namesake mechanic. They are permanent character modifications earned through gameplay
            milestones across PvE, PvP, crafting, and exploration. Unlike talents, Scars cannot be respecced.
            Two players with the same class, build, and gear will still differ because of their Scars.
          </p>
          <div className="space-y-3">
            {[
              'Earned through achievements, not bought or dropped.',
              'Cannot be respecced. Every Scar is a permanent decision.',
              'Adds identity beyond your class, race, and talent choices.',
            ].map((point) => (
              <div key={point} className="flex gap-3 rounded-lg border border-border-subtle bg-void-black/25 px-4 py-3">
                <span className="mt-1 h-2.5 w-2.5 rotate-45 bg-honor-gold shrink-0" />
                <p className="text-sm text-text-secondary">{point}</p>
              </div>
            ))}
          </div>
        </Link>
      </section>

      {/* Races & Factions */}
      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-honor-gold/70 mb-2">Races & Factions</p>
            <h2 className="font-heading text-2xl text-honor-gold">8 Races, 2 Factions, 1 War</h2>
          </div>
          <Link href="/races" className="text-sm text-honor-gold/70 hover:text-honor-gold transition-colors">
            View races
          </Link>
        </div>
        <p className="text-text-secondary max-w-3xl leading-relaxed mb-6">
          Your race locks you into a faction. Sacred Order or Domination, 4 races each.
          Race also restricts which classes you can play, so it is not just a cosmetic pick.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { faction: factions.sacredOrder, accent: 'border-honor-gold/20', text: 'text-honor-gold', hover: 'hover:border-honor-gold/40' },
            { faction: factions.domination, accent: 'border-scar-red/20', text: 'text-scar-red-light', hover: 'hover:border-scar-red/40' },
          ].map(({ faction, accent, text, hover }) => (
            <div key={faction.name} className={`rounded-2xl border ${accent} ${hover} bg-card-bg p-6 transition-colors`}>
              <div className="flex items-center gap-3 mb-2">
                <img src={faction.icon} alt={faction.name} className="w-10 h-10 rounded" />
                <div>
                  <h3 className={`font-heading text-2xl ${text}`}>{faction.name}</h3>
                  <p className="text-xs text-text-muted">{faction.races.length} races</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4">{faction.summary}</p>
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
                    <div className="text-[11px] text-text-muted">{race.availableClasses.length} classes available</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it connects */}
      <section className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8 mb-12">
        <h2 className="font-heading text-2xl text-honor-gold mb-4">How It All Connects</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', label: 'Pick a Race', desc: 'This locks your faction and limits your class options.' },
            { step: '2', label: 'Pick a Class', desc: 'Each class has 240+ talent nodes across three paths. No subclass lock.' },
            { step: '3', label: 'Build Your Talents', desc: 'Spend points however you want. Go deep in one path or spread across all three.' },
            { step: '4', label: 'Earn Your Scars', desc: 'Permanent progression earned through gameplay. Cannot be respecced.' },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border border-border-subtle bg-dark-surface/40 p-4">
              <div className="text-2xl font-heading text-honor-gold mb-1">{item.step}</div>
              <div className="text-sm font-medium text-text-primary mb-1">{item.label}</div>
              <div className="text-xs text-text-muted">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-text-secondary mb-4">Ready to start building?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/talents"
            className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Talent Calculator
          </Link>
          <Link
            href="/classes"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            View All Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
