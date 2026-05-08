import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { professions } from '@/data/professions';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export function generateStaticParams() {
  return professions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prof = professions.find((p) => p.slug === slug);
  if (!prof) return { title: 'Not Found' };
  const isGathering = prof.type === 'Gathering';
  const title = isGathering
    ? `Scars of Honor ${prof.name}: Tools, Materials & Tiers | ScarsHQ`
    : `Scars of Honor ${prof.name}: Recipes, Station & Outputs | ScarsHQ`;
  const description = isGathering
    ? `${prof.name} in Scars of Honor uses a dedicated tool slot. Full list of nodes, tiers, drops, and the crafting professions it feeds into, sourced from the Spring 2026 playtest client.`
    : `${prof.name} in Scars of Honor: how the ${prof.station ?? 'station'} works, recipe categories, difficulty ratings, and which gathering professions feed it. Datamined from the Spring 2026 playtest.`;
  return {
    title,
    description,
    alternates: { canonical: `/professions/${prof.slug}` },
    openGraph: {
      title,
      description,
      url: `/professions/${prof.slug}`,
      type: 'article',
    },
  };
}

// Long-form SEO content per profession. Each block adds the unique mechanics,
// tier names, and station details that don't live on the main data object.
const EXTRA: Record<string, { intro: string; mechanic: string; extras: { heading: string; items: string[] }[] }> = {
  mining: {
    intro:
      'Mining is one of five gathering professions in Scars of Honor. It produces ores, ingots, and gemstones used by Blacksmithing to forge weapons, armor, and tools.',
    mechanic:
      'Veins spawn in four sizes — Small, Medium, Large, and Massive — and have a Vein Integrity bar that drops with every hit. Press E or right click to mine. Larger veins yield more ore per node and can hold up to several stacks of resource.',
    extras: [
      {
        heading: 'Vein subtypes (10 tiers)',
        items: ['Cuprous', 'Iron', 'Cerulean', 'Onyx', 'Indigo', 'Amber', 'Fucium', 'Pallid', 'Ebony', 'Aurora'],
      },
      {
        heading: 'Pickaxe tiers',
        items: [
          "Scout's Pickaxe",
          "Adventurer's Pickaxe",
          "Miner's Pickaxe",
          'Refined Pickaxe',
          'Jet-Black Pickaxe',
          'Masterful Pickaxe',
          'Adamant Pickaxe',
          'Stellar Pickaxe',
          'Comet Pickaxe',
          'Draketalon Pickaxe',
        ],
      },
    ],
  },
  woodcutting: {
    intro:
      'Woodcutting is the gathering profession for chopping trees. The wood it produces feeds Blacksmithing for bow staves, hafts, and weapon furniture.',
    mechanic:
      'Trees have a Tree Integrity bar. Hold and release the action button to chop — releasing at the right moment gives a cleaner hit and better yield. Each tree species produces a specific wood type.',
    extras: [
      {
        heading: 'Wood tiers (10)',
        items: ['Lightwood', 'Finewood', 'Darkwood', 'Crystalwood', 'Swampwood', 'Frostwood', 'Flamewood', 'Steelwood', 'Diamondwood', 'Dragonwood'],
      },
      {
        heading: 'Tree species',
        items: ['Glowtree', 'Brownhorn', 'Oaknoar', 'Glassfir', 'Cronetree', 'Needletree', 'Ashtree', 'Spiketree', 'Skybirch', 'Draconic Tree'],
      },
      {
        heading: 'Axe tiers',
        items: [
          "Ranger's Axe",
          "Adventurer's Axe",
          "Lumberjack's Axe",
          'Refined Axe',
          'Masterful Axe',
          'Jet-Black Axe',
          'Adamant Axe',
          'Stellar Axe',
          'Comet Axe',
          'Draketalon Axe',
        ],
      },
    ],
  },
  herbalism: {
    intro:
      'Herbalism is the gathering profession for harvesting plants, fungi, and flowers used in Alchemy and Cooking. The internal engine name is Gardening, but every UI string and the equipment tool slot label it Herbalism.',
    mechanic:
      'Herbs are world objects you interact with directly. Each plant grows in a specific biome and has its own use in alchemy or cooking recipes.',
    extras: [
      {
        heading: 'Confirmed plants',
        items: ['Silverflower', 'Ghostleaf', 'Stenchflower', 'Black Thyme', 'Glowfruit', 'Glowseed', 'Silverseed', 'Pale Quartz', 'Ashen Quartz'],
      },
    ],
  },
  carving: {
    intro:
      'Carving is the gathering profession for harvesting hides, bones, and other materials from defeated creatures. It is the in game name for what other MMOs call skinning, with its own dedicated tool slot.',
    mechanic:
      'After killing the right kind of beast, carving lets you take its pelt and bones. Quality and quantity scale with the creature level and the carver tier.',
    extras: [
      {
        heading: 'Confirmed materials',
        items: ['Soft Skin', 'Hard Skin', 'Gorejaw Pelt', 'Thick Leather Scraps', 'Small Skeleton Bone', 'Big Skeleton Bone', 'Bone Marrow', 'Resin'],
      },
    ],
  },
  fishing: {
    intro:
      'Fishing is the gathering profession for catching fish at fishing spots along rivers, lakes, and coasts. The fish meat it produces is the primary input for Cooking.',
    mechanic:
      "The fishing minigame asks you to track the fish's movement and a Fish Strength bar through the round. Pearls and Fish Scales are extra drops on top of meat.",
    extras: [
      {
        heading: 'Fish meat tiers (10)',
        items: [
          'Grey Fish Meat',
          'White Fish Meat',
          'Red Fish Meat',
          'Fatty Fish Meat',
          'Frostcut Meat',
          'Goldenstrips',
          'Glassflesh',
          'Blackfin Meat',
          'Glowmeat',
          'Starfillet',
        ],
      },
      {
        heading: 'Spot sizes',
        items: ['Small', 'Medium', 'Large', 'Monstrous'],
      },
      {
        heading: 'Harpoon tiers',
        items: [
          'Makeshift Harpoon',
          "Fisherman's Harpoon",
          "Pirate's Harpoon",
          'Refined Harpoon',
          'Masterful Harpoon',
          'Jet-Black Harpoon',
          'Adamant Harpoon',
          'Stellar Harpoon',
          'Comet Harpoon',
          'Draketalon Harpoon',
        ],
      },
    ],
  },
  blacksmithing: {
    intro:
      'Blacksmithing is the crafting profession for weapons, armor, sidearms, and tools. It runs at a forge and consumes inputs from Mining, Woodcutting, and Carving.',
    mechanic:
      'Press E or right click to forge. The recipe menu sorts outputs into Weapons, Armor, Sidearms, Tools, and Miscs, with difficulty ratings of Easy, Moderate, Challenging, Difficult, and Formidable. Common, Rare, Epic, and Legendary outputs can roll Masterwork Bonuses, Set Bonuses, and Soulbinding.',
    extras: [
      {
        heading: 'Forge grades',
        items: ['Village Forge', 'Town Forge', 'Military Forge'],
      },
      {
        heading: 'Recipe categories',
        items: ['Weapons', 'Armor', 'Sidearms', 'Tools', 'Miscs'],
      },
      {
        heading: 'Difficulty ratings',
        items: ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Formidable'],
      },
    ],
  },
  cooking: {
    intro:
      'Cooking is the crafting profession for food. It runs at a Cauldron with a temperature timing minigame and consumes ingredients from Fishing, Herbalism, and Carving.',
    mechanic:
      'Add ingredients in the right order at the required temperature. The heat bar runs Cold, Warm, Hot, Very hot, Searing. Each recipe needs a starting amount of fuel and the heat ticks down between actions.',
    extras: [
      {
        heading: 'Heat levels',
        items: ['Cold', 'Warm', 'Hot', 'Very hot', 'Searing'],
      },
      {
        heading: 'Confirmed dishes',
        items: ['Boiled Potatoes', 'Beefy Meat Stew', 'Grey Fish Stew', 'Lean Meat Stew', "Pirate's Stew"],
      },
    ],
  },
  alchemy: {
    intro:
      'Alchemy is the crafting profession for potions and elixirs. It runs at an Alchemy Stand and uses inputs from Herbalism and Carving.',
    mechanic:
      'The action button at the alchemy stand reads "Brew." Each base potion has Potent, Strong, and Divine variants, with higher rarity recipes able to roll Masterwork Bonuses and Set Bonuses.',
    extras: [
      {
        heading: 'Stand grades',
        items: ['Rickety Alchemy Stand', 'Ordinary Alchemy Stand'],
      },
      {
        heading: 'Confirmed potions',
        items: ['Healing Potion', 'Power Potion', 'Lightfeet Potion', 'Fury Potion', 'Barkskin Potion', 'Magic Resistance Potion'],
      },
      {
        heading: 'Quality variants',
        items: ['Base', 'Potent', 'Strong', 'Divine'],
      },
    ],
  },
};

export default async function ProfessionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prof = professions.find((p) => p.slug === slug);
  if (!prof) notFound();

  const extra = EXTRA[prof.slug];
  const isGathering = prof.type === 'Gathering';
  const accent = isGathering ? 'text-green-400' : 'text-honor-gold';
  const accentBg = isGathering ? 'bg-green-500/10 text-green-400' : 'bg-honor-gold/10 text-honor-gold';

  // Build "feeds" for synergy display
  const feedsInto = professions.filter((p) => prof.synergies.includes(p.name));
  const fedBy = professions.filter((p) => p.synergies.includes(prof.name));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Professions', url: '/professions' },
          { name: prof.name, url: `/professions/${prof.slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/professions" className="hover:text-honor-gold transition-colors">Professions</Link>
        <span>/</span>
        <span className="text-text-primary">{prof.name}</span>
      </nav>

      {/* Hero */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <div className="shrink-0 w-24 h-24 rounded-md bg-card-bg border border-border-subtle/60 p-3 flex items-center justify-center">
          <Image src={prof.icon} alt={`${prof.name} icon`} width={96} height={96} className="object-contain w-full h-full" />
        </div>
        <div className="min-w-0">
          <span className={`inline-block text-xs uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${accentBg}`}>
            {prof.type}
          </span>
          <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">{prof.name}</h1>
          <p className="text-text-secondary leading-relaxed max-w-3xl">{prof.description}</p>
          {(prof.tool || prof.station) && (
            <p className="text-sm text-text-muted mt-2">
              {prof.tool && (
                <>
                  <span className="uppercase tracking-wider mr-1">Tool:</span>
                  <span className={accent}>{prof.tool}</span>
                </>
              )}
              {prof.station && (
                <>
                  <span className="uppercase tracking-wider mr-1">Station:</span>
                  <span className={accent}>{prof.station}</span>
                </>
              )}
            </p>
          )}
        </div>
      </header>

      {/* Intro long form */}
      {extra && (
        <section className="mb-10 max-w-3xl">
          <p className="text-text-secondary leading-relaxed">{extra.intro}</p>
        </section>
      )}

      {/* Sample materials grid (linking to database) */}
      {prof.sampleMaterials.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-2xl text-honor-gold mb-4">Sample {isGathering ? 'Drops' : 'Outputs'}</h2>
          <p className="text-sm text-text-muted mb-4">Click an icon to open its full database listing.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {prof.sampleMaterials.map((m) => {
              const card = (
                <>
                  <div className="aspect-square rounded bg-dark-surface/70 border border-border-subtle/60 p-2 flex items-center justify-center">
                    <Image src={m.icon} alt={m.name} width={96} height={96} className="object-contain w-full h-full" />
                  </div>
                  <span className="block mt-2 text-xs text-text-secondary text-center truncate">{m.name}</span>
                </>
              );
              return m.slug ? (
                <Link
                  key={m.name}
                  href={`/database/${m.slug}`}
                  className="group block hover:[&_div]:border-honor-gold-dim transition-colors"
                  title={`View ${m.name} in database`}
                >
                  {card}
                </Link>
              ) : (
                <div key={m.name}>{card}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mechanic */}
      {extra && (
        <section className="mb-12 bg-card-bg border border-border-subtle rounded-lg p-6">
          <h2 className="font-heading text-2xl text-honor-gold mb-3">How {prof.name} Works</h2>
          <p className="text-text-secondary leading-relaxed">{extra.mechanic}</p>
          <p className="text-text-secondary leading-relaxed mt-3">{prof.details}</p>
        </section>
      )}

      {/* Extras: tier lists, station grades, etc. */}
      {extra && (
        <section className="mb-12 grid md:grid-cols-2 gap-6">
          {extra.extras.map((block) => (
            <div key={block.heading} className="bg-card-bg border border-border-subtle rounded-lg p-5">
              <h3 className="font-heading text-lg text-text-primary mb-3">{block.heading}</h3>
              <ol className="space-y-1 text-sm text-text-secondary">
                {block.items.map((it, i) => (
                  <li key={it} className="flex items-baseline gap-2">
                    <span className="text-text-muted text-xs w-5 shrink-0">{i + 1}.</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}

      {/* Full produces list */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-honor-gold mb-4">
          {isGathering ? 'Everything you can gather' : 'Recipe categories'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {prof.produces.map((item) => (
            <span key={item} className="text-sm px-3 py-1 rounded bg-dark-surface text-text-secondary">{item}</span>
          ))}
        </div>
      </section>

      {/* Synergies */}
      {(feedsInto.length > 0 || fedBy.length > 0) && (
        <section className="mb-12">
          <h2 className="font-heading text-2xl text-honor-gold mb-4">Material Flow</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {feedsInto.length > 0 && (
              <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">{prof.name} feeds into</p>
                <div className="flex flex-wrap gap-3">
                  {feedsInto.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/professions/${f.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded bg-dark-surface text-text-secondary hover:bg-dark-surface/60 hover:text-honor-gold transition-colors"
                    >
                      <Image src={f.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                      {f.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {fedBy.length > 0 && (
              <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Fed by</p>
                <div className="flex flex-wrap gap-3">
                  {fedBy.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/professions/${f.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded bg-dark-surface text-text-secondary hover:bg-dark-surface/60 hover:text-honor-gold transition-colors"
                    >
                      <Image src={f.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                      {f.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* All other professions */}
      <section className="mt-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-xl text-honor-gold text-center mb-6">Other Professions</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {professions
            .filter((p) => p.slug !== prof.slug)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/professions/${other.slug}`}
                className="group flex flex-col items-center gap-1 p-2 rounded border border-border-subtle/60 bg-card-bg hover:border-honor-gold-dim transition-colors"
              >
                <Image src={other.icon} alt="" width={32} height={32} className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] text-text-secondary group-hover:text-honor-gold transition-colors">{other.name}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
