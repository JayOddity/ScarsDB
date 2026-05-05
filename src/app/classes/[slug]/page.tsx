import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { classes, allRaces } from '@/data/classes';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { isPlayableSlug, loadClassAbilities, type ClassTreeAbilities } from '@/lib/classTalents';

export function generateStaticParams() {
  return classes.map((cls) => ({ slug: cls.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const cls = classes.find((c) => c.slug === slug);
    if (!cls) return { title: 'Not Found' };
    const playable = isPlayableSlug(slug);
    const title = playable
      ? `Scars of Honor ${cls.name}: Abilities, Talents & Builds | ScarsHQ`
      : `${cls.name} Class Guide | ScarsHQ`;
    const description = playable
      ? `${cls.name} is playable in the Spring 2026 Scars of Honor playtest. Full active and starting ability list from the playtest client, talent tree, and available races.`
      : cls.description;
    return {
      title,
      description,
      alternates: { canonical: `/classes/${cls.slug}` },
    };
  });
}

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cls = classes.find((c) => c.slug === slug);
  if (!cls) notFound();

  const playable = isPlayableSlug(slug);
  const abilities: ClassTreeAbilities | null = playable ? loadClassAbilities(slug) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Classes', url: '/classes' },
          { name: cls.name, url: `/classes/${cls.slug}` },
        ]}
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/classes" className="hover:text-honor-gold transition-colors">Classes</Link>
        <span>/</span>
        <span className="text-text-primary">{cls.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={cls.icon} alt={cls.name} className="w-20 h-20" />
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name}</h1>
          <span className="text-sm px-3 py-1 rounded bg-honor-gold/10 text-honor-gold font-medium">
            {cls.subtitle}
          </span>
        </div>
      </div>

      {/* Description */}
      <section className="mb-10">
        <p className="text-text-secondary leading-relaxed">{cls.description}</p>
      </section>

      {/* Subclasses / Paths */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Paths</h2>
        <div className="flex flex-wrap gap-3">
          {cls.subclasses.map((sub) => (
            <div key={sub.name} className="bg-card-bg border border-border-subtle rounded-lg px-5 py-3">
              <span className="font-heading text-lg text-text-primary">{sub.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Available Races */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Available Races</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allRaces.filter((r) => r.availableClasses.includes(cls.slug)).map((race) => {
            const isOrder = race.faction === 'sacred-order';
            return (
              <Link
                key={race.slug}
                href={`/races/${race.slug}`}
                className={`bg-card-bg border rounded-lg px-4 py-3 flex items-center gap-3 transition-colors hover:translate-y-[-1px] ${isOrder ? 'border-honor-gold/15 hover:border-honor-gold/40' : 'border-scar-red/15 hover:border-scar-red/40'}`}
              >
                <Image src={race.banner} alt={race.name} width={32} height={32} className="object-contain" />
                <div>
                  <span className={`font-heading text-sm ${isOrder ? 'text-honor-gold' : 'text-scar-red-light'}`}>{race.name}</span>
                  <span className="block text-[10px] text-text-muted">{isOrder ? 'Sacred Order' : 'Domination'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Abilities (playable in Spring 2026 playtest) */}
      {abilities ? (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-heading text-xl text-honor-gold">Abilities from the playtest client</h2>
            <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-emerald-400/30 text-emerald-300 bg-emerald-500/10">
              Playable now
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-6 max-w-3xl">
            Pulled directly from the Spring 2026 playtest client. Spell text is verbatim from the game data, including any minor typos.
          </p>

          {abilities.active.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-heading text-sm uppercase tracking-[0.18em] text-honor-gold-light mb-3">
                Active abilities ({abilities.active.length})
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {abilities.active.map((a, i) => (
                  <li key={`active-${i}`} className="flex gap-3 p-3 bg-card-bg border border-border-subtle rounded-lg">
                    {a.iconUrl ? (
                      <img src={a.iconUrl} alt="" className="w-10 h-10 flex-shrink-0 rounded" />
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 rounded bg-dark-surface/80" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary font-heading">{a.name}</p>
                      <p className="text-xs text-text-muted leading-snug">{a.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {abilities.start.length > 0 ? (
            <div>
              <h3 className="font-heading text-sm uppercase tracking-[0.18em] text-honor-gold-light mb-3">
                Starting talents ({abilities.start.length})
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {abilities.start.map((a, i) => (
                  <li key={`start-${i}`} className="flex gap-3 p-3 bg-card-bg border border-border-subtle rounded-lg">
                    {a.iconUrl ? (
                      <img src={a.iconUrl} alt="" className="w-10 h-10 flex-shrink-0 rounded" />
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 rounded bg-dark-surface/80" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary font-heading">{a.name}</p>
                      <p className="text-xs text-text-muted leading-snug">{a.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="mb-10">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-border-subtle text-text-muted bg-dark-surface/40 inline-block mb-3">
              Not in current playtest
            </p>
            <p className="text-sm text-text-secondary">
              {cls.name} is not in the Spring 2026 playtest. The four playable classes this test are{' '}
              <Link href="/classes/druid" className="text-honor-gold hover:text-honor-gold-light">Druid</Link>,{' '}
              <Link href="/classes/mage" className="text-honor-gold hover:text-honor-gold-light">Mage</Link>,{' '}
              <Link href="/classes/paladin" className="text-honor-gold hover:text-honor-gold-light">Paladin</Link>, and{' '}
              <Link href="/classes/ranger" className="text-honor-gold hover:text-honor-gold-light">Ranger</Link>. Real ability data for {cls.name} will be added once it is datamined from a future playtest.
            </p>
          </div>
        </section>
      )}

      {/* Source */}
      <p className="text-xs text-text-muted mb-10">
        Source: <a href="https://www.scarsofhonor.com/classes" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/classes</a>
        {playable ? '; ability text from the Spring 2026 playtest client.' : '.'}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/talents/${cls.slug}`}
          className="px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-center"
        >
          Open Talent Calculator
        </Link>
        <Link
          href="/classes"
          className="px-6 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-center"
        >
          Explore All Classes
        </Link>
      </div>
    </div>
  );
}
