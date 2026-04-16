import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor Map - Interactive World Map of Aragon | ScarsHQ',
  description:
    'The Scars of Honor map. See the full interactive world map of Aragon - continents, zones, cities and regions across Grommdor, Mynorath and Irongarth.',
  keywords: [
    'scars of honor map',
    'scars of honor interactive map',
    'scars of honor world map',
    'scars of honor zones',
    'aragon map',
    'grommdor map',
    'mynorath map',
    'irongarth map',
  ],
  openGraph: {
    title: 'Scars of Honor Map - Interactive World Map of Aragon',
    description:
      'The Scars of Honor map. Full interactive world map of Aragon with every continent, zone, city and region revealed so far.',
    url: '/map',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/maps/aragon-world-map.webp',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor interactive world map of Aragon showing Grommdor, Mynorath and the Forgotten Lands',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Map - Interactive World Map of Aragon',
    description:
      'The Scars of Honor map. Full interactive world map of Aragon - Grommdor, Mynorath, Irongarth and every named region.',
    images: ['/images/maps/aragon-world-map.webp'],
  },
  alternates: {
    canonical: '/map',
  },
};

const continents = [
  {
    name: 'Grommdor',
    tone: 'border-scar-red/25 bg-scar-red/5',
    titleColor: 'text-scar-red-light',
    summary:
      'Western continent on the released Scars of Honor world map. Rendered in red and volcanic terrain.',
    highlights: [
      'Innamara - largest walled city visible on the continent',
      'Blazesand and The Eternal Fire - southern regions',
      'The Cursed Hills and Council of Bones - central highlands',
      'Waters of the Dead, Gravestone and Red Waters - northern coastline',
    ],
  },
  {
    name: 'Mynorath',
    tone: 'border-honor-gold/25 bg-honor-gold/5',
    titleColor: 'text-honor-gold',
    summary:
      'Eastern continent on the released world map. Named in Dwarven faction lore as the mountain-range homeland the Depth Clans once ruled.',
    highlights: [
      'Whitesong City - named in Human lore as the capital chosen by King Venuin Stonehill',
      'Lunadell and Silver Forest - northern woodland zones',
      'Silver Valley and Goldrin - central regions',
      'Arrowsand and Cramow Island - southern coast',
    ],
  },
  {
    name: 'The Forgotten Lands',
    tone: 'border-sky-400/25 bg-sky-400/5',
    titleColor: 'text-sky-300',
    summary:
      'Lone island in the Sea of The Gods, marked by a skull glyph on the released world map.',
    highlights: [
      'Sits between Grommdor and Mynorath in the Sea of The Gods',
      'No developer lore has been released for it yet',
    ],
  },
  {
    name: 'Irongarth',
    tone: 'border-emerald-400/25 bg-emerald-400/5',
    titleColor: 'text-emerald-300',
    summary:
      'Named in faction lore as the continent refugees fled to after the fall of the Great Human Empire, and where the Sacred Order was forged. The released regional art is titled "Irongarth, The Western Reach".',
    highlights: [
      'Named in faction lore as the last bastion of humankind',
      'Founding ground of the Sacred Order per faction lore',
      'Sun Elf capital Astra Lumina is placed in its forests in faction lore',
      'The Western Reach is the region featured in the current regional map',
    ],
  },
];

const featuredPlaces = [
  {
    name: 'Whitesong City',
    region: 'Mynorath',
    source: 'Human faction lore',
    blurb:
      'Named in Human faction lore as the capital chosen by King Venuin Stonehill after the fall of the Great Empire. Also appears as a labelled city on the released world map.',
  },
  {
    name: 'Astra Lumina',
    region: 'Irongarth forests',
    source: 'Sun Elf faction lore',
    blurb:
      'Named in Sun Elf faction lore as the "radiant capital" built in the richest forests of Irongarth after the Elves sailed from the Infernal Demons\' lands.',
  },
  {
    name: 'Innamara',
    region: 'Grommdor',
    source: 'World map label',
    blurb:
      'Largest walled city visible on the released Scars of Honor world map, in northern Grommdor. No faction lore has been released for it yet.',
  },
  {
    name: 'The Cursed Hills',
    region: 'Grommdor',
    source: 'World map label',
    blurb:
      'Named region on the released world map, central Grommdor. No faction lore released for it yet.',
  },
  {
    name: 'Blazesand',
    region: 'Grommdor',
    source: 'World map label',
    blurb:
      'Named region on the released world map, southern Grommdor, drawn with red volcanic terrain. No faction lore released for it yet.',
  },
  {
    name: 'Lunadell',
    region: 'Mynorath',
    source: 'World map label',
    blurb:
      'Named settlement on the released world map, northern Mynorath. No faction lore released for it yet.',
  },
  {
    name: 'Goldrin',
    region: 'Mynorath',
    source: 'World map label',
    blurb:
      'Named region on the released world map, central Mynorath. No faction lore released for it yet.',
  },
  {
    name: 'Cramow Island',
    region: 'Mynorath',
    source: 'World map label',
    blurb:
      'Island visible off the southern coast of Mynorath on the released world map. No faction lore released for it yet.',
  },
  {
    name: 'Sea of The Gods',
    region: 'Between continents',
    source: 'World map label',
    blurb:
      'Ocean between Grommdor and Mynorath as labelled on the released world map. The Forgotten Lands sits near its centre.',
  },
];

const faqs = [
  {
    question: 'What is the name of the world in Scars of Honor?',
    answer:
      'The world is named Aragon in Scars of Honor faction lore. On the released world map, Aragon contains two labelled continents — Grommdor and Mynorath — along with an island called The Forgotten Lands sitting in the Sea of The Gods.',
  },
  {
    question: 'Where is Irongarth on the map?',
    answer:
      'Irongarth is named in Scars of Honor faction lore as the continent refugees fled to after the fall of the Great Human Empire, and where the Sacred Order was founded. The only released in-game view of it so far is the regional playtest map titled "Irongarth, The Western Reach".',
  },
  {
    question: 'Will Scars of Honor have an interactive map?',
    answer:
      'A full interactive Scars of Honor map with zones, quest hubs, resource nodes, boss locations and points of interest is planned for ScarsHQ. Until playtest data is live, this page shows the official art maps released by Beastburst Entertainment.',
  },
  {
    question: 'Are there flying mounts in Scars of Honor?',
    answer:
      'No. Scars of Honor uses ground mounts only, per ScarsHQ\'s mounts listing. Travel across Aragon is done on foot, by ground mount, or by ship across the Sea of The Gods.',
  },
  {
    question: 'How big is the Scars of Honor world?',
    answer:
      'Beastburst Entertainment has not published exact size figures. What is confirmed from the released world map: Aragon has two full continents (Grommdor and Mynorath), at least one island (The Forgotten Lands), and a major ocean between them (the Sea of The Gods).',
  },
  {
    question: 'Where does the map data on this page come from?',
    answer:
      'Every named place on this page is taken from either (1) the world map art released by Beastburst Entertainment, (2) the playtest regional map titled "Irongarth, The Western Reach", or (3) named lore in the Scars of Honor faction and race backgrounds. Any place without released lore is flagged as such.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Scars of Honor World Map',
  description:
    'Interactive guide to the world of Aragon in Scars of Honor, including the continents of Grommdor and Mynorath, Irongarth, and the Forgotten Lands.',
  url: 'https://scarshq.com/map',
  about: {
    '@type': 'VideoGame',
    name: 'Scars of Honor',
    genre: 'MMORPG',
    gamePlatform: 'PC',
    publisher: { '@type': 'Organization', name: 'Beastburst Entertainment' },
  },
  image: 'https://scarshq.com/images/maps/aragon-world-map.webp',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function MapsPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-5">
        <div className="max-w-3xl mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Interactive Map</p>
          <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-3">
            Scars of Honor Map — the world of Aragon
          </h1>
          <p className="text-text-secondary leading-8">
            The released Scars of Honor world map, published by Beastburst Entertainment. The
            labelled continents are Grommdor to the west and Mynorath to the east, separated by
            an ocean named the Sea of The Gods with a single island at its centre — The Forgotten
            Lands. A fully interactive Scars of Honor map with zones, points of interest and
            resource nodes is coming soon.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-card-bg p-3 md:p-4">
          <Image
            src="/images/maps/aragon-world-map.webp"
            alt="Scars of Honor world map of Aragon showing the continents of Grommdor and Mynorath, the Forgotten Lands and the Sea of The Gods"
            width={1920}
            height={1080}
            className="w-full h-auto rounded-xl"
            priority
          />
          <p className="text-xs text-text-muted mt-3 px-1">
            Art source: released by Beastburst Entertainment. Labels reflect what is currently
            visible on the map.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {continents.map((c) => (
            <div key={c.name} className={`rounded-2xl border p-6 ${c.tone}`}>
              <h3 className={`font-heading text-2xl mb-3 ${c.titleColor}`}>{c.name}</h3>
              <p className="text-sm text-text-secondary leading-7 mb-4">{c.summary}</p>
              <ul className="space-y-2">
                {c.highlights.map((h) => (
                  <li key={h} className="text-sm text-text-primary leading-6 flex gap-2">
                    <span className="text-honor-gold mt-1">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="max-w-3xl mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Regional map</p>
          <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
            Irongarth — The Western Reach
          </h2>
          <p className="text-text-secondary leading-8">
            The only regional Scars of Honor map released so far, titled &ldquo;Irongarth, The
            Western Reach&rdquo;. This is the region used for the current playtest. Detailed zone
            names, quest hubs and points of interest will be added once playtest data is
            available.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-card-bg p-3 md:p-4">
          <Image
            src="/images/maps/irongarth-western-reach.png"
            alt="Scars of Honor regional map of Irongarth, The Western Reach — the playtest starting area"
            width={1600}
            height={900}
            className="w-full h-auto rounded-xl"
          />
          <p className="text-xs text-text-muted mt-3 px-1">
            Playtest region. Zone names and points of interest will be added to the interactive
            map once playtest data is available.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="max-w-3xl mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Named places</p>
          <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
            Notable cities and zones
          </h2>
          <p className="text-text-secondary leading-8">
            Cities, capitals and landmark zones that have been revealed through the official
            world map and faction lore. Expect more to be added as content unlocks.
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {featuredPlaces.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-border-subtle bg-card-bg p-5 hover:border-honor-gold-dim transition-colors"
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h3 className="font-heading text-lg text-text-primary">{p.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  {p.source}
                </span>
              </div>
              <p className="text-xs text-honor-gold mb-3">{p.region}</p>
              <p className="text-sm text-text-secondary leading-6">{p.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="max-w-3xl mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">FAQ</p>
          <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
            Scars of Honor map questions
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.question}
              className="group rounded-2xl border border-border-subtle bg-card-bg p-5 open:border-honor-gold-dim"
            >
              <summary className="cursor-pointer font-heading text-lg text-text-primary list-none flex items-center justify-between gap-4">
                {f.question}
                <span className="text-honor-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-sm text-text-secondary leading-7 mt-3">{f.answer}</p>
            </details>
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
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Plan ahead</p>
            <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
              Pick your side before you pick your path.
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-6 leading-7">
              The Sacred Order and the Domination are fighting over this map. Choose a faction,
              lock in a class and start planning your build on ScarsHQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/factions"
                className="inline-flex items-center justify-center rounded-lg bg-honor-gold px-8 py-3 font-heading font-semibold text-void-black transition-colors hover:bg-honor-gold-light"
              >
                Compare Factions
              </Link>
              <Link
                href="/classes"
                className="inline-flex items-center justify-center rounded-lg border border-border-subtle px-8 py-3 font-heading font-semibold text-text-secondary transition-colors hover:border-honor-gold-dim hover:text-honor-gold"
              >
                Browse Classes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
