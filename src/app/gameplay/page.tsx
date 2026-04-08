import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { allRaces, classes, factions } from '@/data/classes';
import { professions } from '@/data/professions';

export const metadata: Metadata = {
  title: 'Scars of Honor Gameplay - Combat, Crafting & Systems | ScarsHQ',
  description:
    'Explore the full gameplay loop of Scars of Honor: class builds, faction warfare, dungeons, PvP, crafting, and the permanent Scars system.',
  openGraph: {
    title: 'Scars of Honor Gameplay - Combat, Crafting & Systems',
    description: 'Explore the full gameplay loop of Scars of Honor: class builds, faction warfare, dungeons, PvP, crafting, and the permanent Scars system.',
    url: '/gameplay',
    siteName: 'ScarsHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Gameplay - Combat, Crafting & Systems',
    description: 'Explore the full gameplay loop of Scars of Honor: class builds, faction warfare, dungeons, PvP, crafting, and the permanent Scars system.',
  },
  alternates: {
    canonical: '/gameplay',
  },
};

const statTiles = [
  { value: `${classes.length}`, label: 'Playable classes' },
  { value: `${allRaces.length}`, label: 'Faction-bound races' },
  { value: `${professions.length}`, label: 'Gathering and crafting professions' },
  { value: '2', label: 'Major factions at war' },
];


const systemSpotlights = [
  {
    title: 'Talent Trees',
    eyebrow: 'Character builds',
    description:
      'Big branching trees with real choices. No fixed subclasses. You pick a direction and commit to it, or spread your points wide.',
    href: '/talents',
    cta: 'Open talent calculator',
    accent: 'bg-honor-gold',
  },
  {
    title: 'The Scars System',
    eyebrow: 'Permanent upgrades',
    description:
      'Scars are permanent changes to your character that go beyond talents and gear. They stack over time and make your build truly different from everyone else.',
    href: '/scars',
    cta: 'See how Scars work',
    accent: 'bg-scar-red',
  },
  {
    title: 'Crafting and Gathering',
    eyebrow: 'Professions',
    description:
      'Crafting actually matters here. Gathering and crafting have their own mini games and feed directly into your gear progression.',
    href: '/professions',
    cta: 'Browse professions',
    accent: 'bg-emerald-400',
  },
  {
    title: 'Procedural Dungeons',
    eyebrow: 'PvE content',
    description:
      'Dungeons change between runs. The developers have said layouts and encounters will vary so runs do not play out the same way every time.',
    href: '/pve',
    cta: 'View PvE content',
    accent: 'bg-sky-400',
  },
  {
    title: 'PvP',
    eyebrow: 'Competitive',
    description:
      'Open world faction warfare, a 5v5 battleground, and three way arenas. Multiple modes for different kinds of PvP players.',
    href: '/pvp',
    cta: 'Explore PvP',
    accent: 'bg-violet-400',
  },
  {
    title: 'Mounts and Exploration',
    eyebrow: 'Open world',
    description:
      'Ground mounts for travelling the open world, zones to explore, and faction specific content. No flying mounts.',
    href: '/mounts',
    cta: 'See mounts',
    accent: 'bg-amber-300',
  },
];


const factionPanels = [
  {
    name: factions.sacredOrder.name,
    summary: factions.sacredOrder.summary,
    icon: factions.sacredOrder.icon,
    races: factions.sacredOrder.races,
    href: '/factions',
    accent: 'border-honor-gold/25 bg-honor-gold/5',
    titleColor: 'text-honor-gold',
  },
  {
    name: factions.domination.name,
    summary: factions.domination.summary,
    icon: factions.domination.icon,
    races: factions.domination.races,
    href: '/factions',
    accent: 'border-scar-red/25 bg-scar-red/5',
    titleColor: 'text-scar-red-light',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Scars of Honor',
  description:
    'A free to play fantasy MMORPG with two factions, 10 classes, talent trees, permanent Scars progression, PvP, procedural dungeons, and crafting professions.',
  gamePlatform: 'PC',
  applicationCategory: 'Game',
  genre: 'MMORPG',
  operatingSystem: 'Windows',
  numberOfPlayers: { '@type': 'QuantitativeValue', value: 'Multiplayer' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/PreOrder',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Beastburst Entertainment',
  },
  url: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
};

export default function GameplayPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-6">
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          <div className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-3 w-3 rotate-45 bg-honor-gold" />
              <p className="text-xs uppercase tracking-[0.22em] text-honor-gold">Gameplay</p>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
              Pick a side, build a class, do everything.
            </h1>
            <p className="text-text-secondary leading-8 max-w-3xl">
              Two factions at war. You choose a race and side, spec your class through talents
              and permanent Scars, then take that character into dungeons, PvP, crafting, and
              the open world.
            </p>
          </div>

          <div className="rounded-2xl border border-honor-gold/20 bg-card-bg p-6 glow-gold">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-4">At a glance</p>
            <div className="grid grid-cols-2 gap-3">
              {statTiles.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-subtle bg-dark-surface/60 px-4 py-4"
                >
                  <p className="font-heading text-3xl text-honor-gold mb-1">{stat.value}</p>
                  <p className="text-xs leading-5 text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {factionPanels.map((faction) => (
            <div
              key={faction.name}
              className={`rounded-2xl border p-6 ${faction.accent}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Image src={faction.icon} alt={faction.name} width={36} height={36} className="rounded-md" />
                <h2 className={`font-heading text-2xl ${faction.titleColor}`}>{faction.name}</h2>
              </div>
              <p className="text-sm text-text-secondary leading-7 mb-5">{faction.summary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {faction.races.map((race) => (
                  <Link
                    key={race.slug}
                    href={`/races/${race.slug}`}
                    className="rounded-xl border border-border-subtle/70 bg-dark-surface/40 px-3 py-3 text-center transition-colors hover:border-honor-gold-dim flex flex-col items-center justify-center h-24"
                  >
                    <Image
                      src={race.banner}
                      alt={race.name}
                      width={40}
                      height={40}
                      className="mb-1.5 h-10 w-10 object-contain"
                    />
                    <p className="text-xs text-text-primary leading-tight">{race.name}</p>
                  </Link>
                ))}
              </div>
              <Link href={faction.href} className="text-sm text-honor-gold hover:text-honor-gold-light transition-colors">
                See faction overview &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="max-w-3xl mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Class diversity</p>
          <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
            10 classes, all different
          </h2>
          <p className="text-text-secondary leading-8">
            Tanks, healers, casters, melee DPS, and hybrids. Each class has its own talent tree
            and plays differently depending on how you spec it.
          </p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {classes.map((cls) => (
            <Link
              key={cls.slug}
              href={`/classes/${cls.slug}`}
              className="group flex flex-col items-center gap-0.5 p-2 rounded-lg border border-transparent transition-colors hover:border-honor-gold-dim hover:bg-honor-gold/5"
            >
              <Image
                src={cls.icon}
                alt={cls.name}
                width={128}
                height={128}
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-[10px] text-text-muted group-hover:text-honor-gold transition-colors">{cls.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/classes"
            className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-6 py-3 font-heading font-semibold text-text-secondary transition-colors hover:border-honor-gold-dim hover:text-honor-gold"
          >
            View all classes
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="max-w-3xl mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Game systems</p>
          <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
            What you will actually be doing
          </h2>
          <p className="text-text-secondary leading-8">
            The main systems that make up the game. Each one links to a deeper breakdown on ScarsHQ.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {systemSpotlights.map((system) => (
            <div
              key={system.title}
              className="rounded-2xl border border-border-subtle bg-card-bg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className={`h-1.5 w-16 rounded-full ${system.accent} mb-4`} />
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-3">{system.eyebrow}</p>
              <h3 className="font-heading text-xl text-text-primary mb-3">{system.title}</h3>
              <p className="text-sm text-text-secondary leading-7 mb-5">{system.description}</p>
              <Link
                href={system.href}
                className="text-sm text-honor-gold transition-colors hover:text-honor-gold-light"
              >
                {system.cta} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-honor-gold/20 bg-card-bg px-6 py-10 md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(200,168,78,0.16),_transparent_48%)]" />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Start planning</p>
            <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
              Ready to build your character?
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-6 leading-7">
              Plan your talents and compare gear with ScarsHQ tools before you even log in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/talents"
                className="inline-flex items-center justify-center rounded-lg bg-honor-gold px-8 py-3 font-heading font-semibold text-void-black transition-colors hover:bg-honor-gold-light"
              >
                Open Talent Calculator
              </Link>
              <Link
                href="/gear"
                className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-8 py-3 font-heading font-semibold text-text-secondary transition-colors hover:border-honor-gold-dim hover:text-honor-gold"
              >
                Use Gear Planner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
