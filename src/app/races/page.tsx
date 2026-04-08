import Link from 'next/link';
import { factions, classes, allRaces } from '@/data/classes';

const classMap = new Map(classes.map((c) => [c.slug, c]));

export const metadata = {
  title: 'Races - ScarsHQ',
  description: 'All 8 playable races in Scars of Honor. Humans, Sun Elves, Dwarves, Bearans, Orcs, Infernal Demons, Undead, and Gronthar.',
  alternates: { canonical: '/races' },
};

export default function RacesPage() {
  const sections = [
    { faction: factions.sacredOrder, color: 'gold' as const },
    { faction: factions.domination, color: 'red' as const },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl text-honor-gold mb-4">Races of Aragon</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Eight races divided across two factions wage war over the fate of Irongarth.
          Your race shapes your story, your allies, and your enemies.
        </p>
      </div>

      {/* Race & Class chart */}
      <div className="mb-16 rounded-xl overflow-hidden border border-border-subtle">
        <img
          src="/Icons/races-classes-chart.webp"
          alt="Races & Classes compatibility chart"
          className="w-full h-auto"
        />
      </div>

      {sections.map(({ faction, color }, fi) => {
        const isGold = color === 'gold';
        return (
          <div key={faction.name}>
            {fi > 0 && (
              <div className="diamond-divider my-16">
                <span className="diamond" />
              </div>
            )}

            {/* Faction label */}
            <div className="flex items-center gap-3 mb-8">
              <img src={faction.icon} alt={faction.name} width={32} height={32} className="rounded" />
              <Link href="/factions" className={`font-heading text-xl hover:opacity-80 transition-opacity ${isGold ? 'text-honor-gold' : 'text-scar-red'}`}>
                {faction.name}
              </Link>
            </div>

            {/* Race cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {faction.races.map((race) => (
                <Link
                  key={race.slug}
                  href={`/races/${race.slug}`}
                  className={`group relative bg-card-bg border rounded-xl overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-xl ${isGold ? 'border-honor-gold/15 hover:border-honor-gold/40 hover:shadow-honor-gold/5' : 'border-scar-red/15 hover:border-scar-red/40 hover:shadow-scar-red/5'}`}
                >
                  <div className="p-6 flex gap-5">
                    {/* Race crest */}
                    <div className="flex-shrink-0 w-16 h-16 relative">
                      <img src={race.banner} alt={race.name} width={64} height={64} className="object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h2 className={`font-heading text-2xl group-hover:translate-x-1 transition-transform ${isGold ? 'text-honor-gold' : 'text-scar-red-light'}`}>
                          {race.name}
                        </h2>
                        <span className={`text-xs italic ${isGold ? 'text-honor-gold/60' : 'text-scar-red/60'}`}>
                          {race.tagline}
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed mb-3">{race.description}</p>

                      {/* Available classes */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[10px] text-text-muted uppercase tracking-wide">Classes:</span>
                        {race.availableClasses.map((slug) => {
                          const cls = classMap.get(slug);
                          if (!cls) return null;
                          return (
                            <span key={slug} title={cls.name}>
                              <img src={cls.icon} alt={cls.name} width={24} height={24} className="opacity-80" />
                            </span>
                          );
                        })}
                      </div>

                      <span className={`text-xs font-medium ${isGold ? 'text-honor-gold/50 group-hover:text-honor-gold' : 'text-scar-red/50 group-hover:text-scar-red-light'} transition-colors`}>
                        View full history →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-text-muted mt-16 text-center">
        Source: <a href="https://www.scarsofhonor.com/races" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/races</a>
      </p>
    </div>
  );
}
