import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { allRaces, factions } from '@/data/classes';

export function generateStaticParams() {
  return allRaces.map((race) => ({ slug: race.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const race = allRaces.find((r) => r.slug === slug);
    if (!race) return { title: 'Not Found' };
    return {
      title: `${race.name} - ScarsHQ`,
      description: race.description,
    };
  });
}

export default async function RacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = allRaces.find((r) => r.slug === slug);
  if (!race) notFound();

  const isOrder = race.faction === 'sacred-order';
  const faction = isOrder ? factions.sacredOrder : factions.domination;
  const otherRaces = faction.races.filter((r) => r.slug !== race.slug);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/races" className="hover:text-honor-gold transition-colors">Races</Link>
        <span>/</span>
        <span className="text-text-primary">{race.name}</span>
      </nav>

      {/* Header with body art */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-1">
          <Link
            href="/factions"
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1.5 mb-3 ${isOrder ? 'bg-honor-gold/10 text-honor-gold hover:bg-honor-gold/20' : 'bg-scar-red/10 text-scar-red-light hover:bg-scar-red/20'}`}
          >
            <Image src={faction.icon} alt={faction.name} width={14} height={14} className="rounded-sm" />
            {faction.name}
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl text-honor-gold mb-2">{race.name}</h1>
          <p className={`text-lg italic mb-6 ${isOrder ? 'text-honor-gold/50' : 'text-scar-red/50'}`}>{race.tagline}</p>
          <p className="text-text-secondary leading-relaxed text-lg">{race.description}</p>
        </div>
        <div className="md:w-64 flex-shrink-0 flex justify-center">
          <Image
            src={race.image}
            alt={race.name}
            width={256}
            height={384}
            className="object-contain max-h-[400px] drop-shadow-2xl"
          />
        </div>
      </div>

      {/* History */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl text-honor-gold mb-4">History</h2>
        <div className="bg-card-bg border border-border-subtle rounded-xl p-6 md:p-8">
          <p className="text-text-secondary leading-loose">{race.history}</p>
        </div>
      </section>

      {/* Other races in faction */}
      {otherRaces.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-lg text-text-muted mb-4">Other {faction.name} Races</h2>
          <div className="flex flex-wrap gap-3">
            {otherRaces.map((r) => (
              <Link
                key={r.slug}
                href={`/races/${r.slug}`}
                className={`flex items-center gap-2 px-4 py-2 bg-card-bg border rounded-lg text-sm font-heading transition-all hover:translate-y-[-1px] ${isOrder ? 'border-honor-gold/15 text-honor-gold hover:border-honor-gold/40' : 'border-scar-red/15 text-scar-red-light hover:border-scar-red/40'}`}
              >
                <Image src={r.image} alt={r.name} width={24} height={24} className="rounded" />
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Source */}
      <p className="text-xs text-text-muted mb-10">
        Source: <a href="https://www.scarsofhonor.com/races" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/races</a>
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/factions"
          className="px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-center"
        >
          View Factions
        </Link>
        <Link
          href="/races"
          className="px-6 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-center"
        >
          Explore All Races
        </Link>
      </div>
    </div>
  );
}
