import Image from 'next/image';
import Link from 'next/link';
import { professions, type Profession } from '@/data/professions';

export const metadata = {
  title: 'Professions - ScarsHQ',
  description: 'Five gathering and three crafting professions in Scars of Honor: Mining, Woodcutting, Herbalism, Carving, Fishing, Blacksmithing, Cooking, and Alchemy.',
  alternates: { canonical: '/professions' },
};

function ProfessionCard({ prof }: { prof: Profession }) {
  const isGathering = prof.type === 'Gathering';
  const accent = isGathering ? 'text-green-400' : 'text-honor-gold';
  const accentBg = isGathering ? 'bg-green-500/10 text-green-400' : 'bg-honor-gold/10 text-honor-gold';
  const hoverBorder = isGathering ? 'hover:border-green-500/40' : 'hover:border-honor-gold-dim';
  const meta = isGathering ? prof.tool : prof.station;
  const metaLabel = isGathering ? 'Tool' : 'Station';

  return (
    <div
      id={prof.slug}
      className={`group relative bg-card-bg border border-border-subtle rounded-lg overflow-hidden transition-colors scroll-mt-24 ${hoverBorder} glow-gold-hover`}
    >
      {/* Header band with hero icon */}
      <Link
        href={`/professions/${prof.slug}`}
        className="relative flex items-center gap-4 p-5 border-b border-border-subtle/60 bg-gradient-to-br from-dark-surface/40 to-transparent hover:bg-dark-surface/30 transition-colors"
      >
        <div className="relative shrink-0 w-16 h-16 rounded-md bg-dark-surface/60 border border-border-subtle/60 p-1.5 flex items-center justify-center">
          <Image
            src={prof.icon}
            alt={`${prof.name} icon`}
            width={64}
            height={64}
            className="object-contain w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-xl text-text-primary truncate group-hover:text-honor-gold transition-colors">{prof.name}</h3>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${accentBg}`}>
              {prof.type}
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-snug">{prof.description}</p>
          {meta && (
            <p className="text-xs text-text-muted mt-1">
              <span className="uppercase tracking-wider">{metaLabel}:</span>{' '}
              <span className={accent}>{meta}</span>
            </p>
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Sample materials icon row */}
        {prof.sampleMaterials.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Sample {isGathering ? 'Drops' : 'Outputs'}</p>
            <div className="grid grid-cols-4 gap-2">
              {prof.sampleMaterials.map((m) => {
                const inner = (
                  <>
                    <Image
                      src={m.icon}
                      alt={m.name}
                      width={56}
                      height={56}
                      className="object-contain w-full h-full"
                    />
                    <span className="absolute inset-x-1 bottom-1 text-[10px] text-text-secondary text-center bg-dark-bg/80 rounded-sm px-0.5 opacity-0 group-hover/mat:opacity-100 transition-opacity truncate">
                      {m.name}
                    </span>
                  </>
                );
                const cardClasses =
                  'group/mat relative aspect-square rounded bg-dark-surface/70 border border-border-subtle/60 p-1 flex items-center justify-center transition-colors';
                if (m.slug) {
                  return (
                    <Link
                      key={m.name}
                      href={`/database/${m.slug}`}
                      className={`${cardClasses} hover:border-honor-gold-dim hover:bg-dark-surface`}
                      title={`View ${m.name} in database`}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <div key={m.name} className={cardClasses} title={m.name}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-sm text-text-secondary mb-4">{prof.details}</p>

        <div className="mb-3">
          <p className="text-xs text-text-muted mb-1.5 uppercase tracking-wider">
            {isGathering ? 'Produces' : 'Recipe Categories'}
          </p>
          <div className="flex flex-wrap gap-1">
            {prof.produces.map((item) => (
              <span key={item} className="text-xs px-2 py-0.5 rounded bg-dark-surface text-text-secondary">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-text-muted mb-1.5 uppercase tracking-wider">Feeds Into</p>
          <div className="flex flex-wrap gap-1">
            {prof.synergies.map((s) => (
              <Link
                key={s}
                href={`/professions/${s.toLowerCase()}`}
                className="text-xs px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold hover:bg-honor-gold/20 transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href={`/professions/${prof.slug}`}
          className="inline-flex items-center gap-1 text-sm text-honor-gold hover:text-honor-gold-dim transition-colors"
        >
          Full {prof.name} guide
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

export default function ProfessionsPage() {
  const gathering = professions.filter((p) => p.type === 'Gathering');
  const crafting = professions.filter((p) => p.type === 'Crafting');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Professions</h1>
      <p className="text-text-secondary mb-4 max-w-6xl">
        Scars of Honor ships with five gathering professions and three crafting actions. Each
        gathering profession has its own tool slot in the equipment screen: Mining (pickaxes),
        Woodcutting (axes), Herbalism, Carving, and Fishing (harpoons). Crafting splits into three
        verbs at three station types: Craft at a Forge for blacksmithing, Cook at a Cauldron for
        food, and Brew at an Alchemy Stand for potions.
      </p>
      <p className="text-text-secondary mb-10 max-w-6xl">
        Names, materials, icons, and mechanics on this page come from the Spring 2026 playtest
        client. The crafting menu sorts recipes into Weapons, Armor, Sidearms, Tools, and Miscs with
        difficulty ratings from Easy up to Formidable, and recipes can roll Masterwork Bonuses, Set
        Bonuses, and Soulbinding.
      </p>

      {/* Quick jump bar */}
      <nav className="mb-12 grid grid-cols-4 sm:grid-cols-8 gap-2">
        {professions.map((prof) => (
          <Link
            key={prof.slug}
            href={`/professions/${prof.slug}`}
            className="group flex flex-col items-center gap-1 p-2 rounded border border-border-subtle/60 bg-card-bg hover:border-honor-gold-dim transition-colors"
          >
            <Image
              src={prof.icon}
              alt={prof.name}
              width={36}
              height={36}
              className="w-9 h-9 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-[10px] text-text-secondary group-hover:text-honor-gold transition-colors">
              {prof.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Gathering */}
      <section id="gathering" className="mb-12 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-green-500 rotate-45" />
          <h2 className="font-heading text-2xl text-green-400">Gathering Professions in Scars of Honor</h2>
          <span className="text-xs text-text-muted">5 professions, one tool slot each</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {gathering.map((prof) => (
            <ProfessionCard key={prof.slug} prof={prof} />
          ))}
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Crafting */}
      <section id="crafting" className="scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 gem-bullet" />
          <h2 className="font-heading text-2xl text-honor-gold">Crafting Professions in Scars of Honor</h2>
          <span className="text-xs text-text-muted">3 stations, three verbs (Craft, Cook, Brew)</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {crafting.map((prof) => (
            <ProfessionCard key={prof.slug} prof={prof} />
          ))}
        </div>
      </section>

      {/* Material flow chart */}
      <section className="mt-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-2">Material Flow</h2>
        <p className="text-sm text-text-muted text-center mb-6">
          How gathered materials feed into the three crafting stations.
        </p>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-3 text-text-muted font-medium uppercase tracking-wider text-xs">Gathering</th>
                <th className="text-center py-3 px-3 text-text-muted font-medium"></th>
                <th className="text-left py-3 px-3 text-text-muted font-medium uppercase tracking-wider text-xs">Crafting</th>
                <th className="text-left py-3 px-3 text-text-muted font-medium uppercase tracking-wider text-xs">Output</th>
              </tr>
            </thead>
            <tbody>
              {[
                { gather: 'mining', craft: ['blacksmithing'], output: 'Weapons, plate armor, shields, tools' },
                { gather: 'woodcutting', craft: ['blacksmithing'], output: 'Bows, hafts, structural wood' },
                { gather: 'carving', craft: ['blacksmithing', 'alchemy'], output: 'Hides for armor, bones for reagents' },
                { gather: 'herbalism', craft: ['alchemy', 'cooking'], output: 'Potions, elixirs, food ingredients' },
                { gather: 'fishing', craft: ['cooking'], output: 'Fish meat, pearls, scales' },
              ].map((row) => {
                const g = professions.find((p) => p.slug === row.gather)!;
                const crafts = row.craft.map((slug) => professions.find((p) => p.slug === slug)!);
                return (
                  <tr key={row.gather} className="border-b border-border-subtle/50 last:border-0">
                    <td className="py-3 px-3">
                      <Link href={`/professions/${g.slug}`} className="flex items-center gap-2 text-text-secondary hover:text-green-400 transition-colors">
                        <Image src={g.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                        {g.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center text-honor-gold">→</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {crafts.map((c) => (
                          <Link key={c.slug} href={`/professions/${c.slug}`} className="flex items-center gap-2 text-text-secondary hover:text-honor-gold transition-colors">
                            <Image src={c.icon} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-text-muted">{row.output}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
