import Link from 'next/link';
import Image from 'next/image';
import { factions } from '@/data/classes';
import type { Faction } from '@/data/classes';

export const metadata = {
  title: 'Factions - ScarsHQ',
  description: 'The Sacred Order vs. The Domination. Two factions locked in eternal war over the fate of Aragon.',
};

function FactionBlock({ faction, color }: { faction: Faction; color: 'gold' | 'red' }) {
  const isGold = color === 'gold';

  return (
    <section className="relative">
      {/* Faction accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${isGold ? 'bg-honor-gold/40' : 'bg-scar-red/40'}`} />

      <div className="pl-8">
        {/* Faction name + summary */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Image src={faction.icon} alt={faction.name} width={40} height={40} className="rounded" />
            <h2 className={`font-heading text-3xl md:text-4xl ${isGold ? 'text-honor-gold' : 'text-scar-red'}`}>
              {faction.name}
            </h2>
          </div>
          <p className={`text-sm italic leading-relaxed ${isGold ? 'text-honor-gold/60' : 'text-scar-red/60'}`}>
            {faction.summary}
          </p>
        </div>

        {/* Lore paragraphs */}
        <div className="space-y-4 mb-10">
          {faction.lore.map((paragraph, i) => (
            <p key={i} className="text-text-secondary leading-relaxed">{paragraph}</p>
          ))}
        </div>

        {/* Races grid */}
        <div className="mb-4">
          <h3 className={`font-heading text-lg mb-4 ${isGold ? 'text-honor-gold/80' : 'text-scar-red/80'}`}>
            Races of {faction.name}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {faction.races.map((race) => (
              <Link
                key={race.slug}
                href={`/races/${race.slug}`}
                className={`group bg-card-bg border rounded-lg p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg ${isGold ? 'border-honor-gold/15 hover:border-honor-gold/40 hover:shadow-honor-gold/5' : 'border-scar-red/15 hover:border-scar-red/40 hover:shadow-scar-red/5'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Image src={race.banner} alt={race.name} width={36} height={36} className="object-contain" />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-heading text-lg group-hover:translate-x-1 transition-transform ${isGold ? 'text-honor-gold' : 'text-scar-red-light'}`}>
                      {race.name}
                    </h4>
                    <span className={`text-[11px] italic ${isGold ? 'text-honor-gold/40' : 'text-scar-red/40'}`}>
                      {race.tagline}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-3">{race.description}</p>
                <span className={`text-xs ${isGold ? 'text-honor-gold/50 group-hover:text-honor-gold' : 'text-scar-red/50 group-hover:text-scar-red-light'} transition-colors`}>
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FactionsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl text-honor-gold mb-4">Factions of Aragon</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Two great powers clash over the fate of Irongarth. Choose your allegiance.
        </p>
      </div>

      <FactionBlock faction={factions.sacredOrder} color="gold" />

      {/* VS divider */}
      <div className="flex items-center gap-6 my-16">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-honor-gold/30 to-honor-gold/50" />
        <span className="font-heading text-2xl text-text-muted tracking-widest">VS</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-scar-red/30 to-scar-red/50" />
      </div>

      <FactionBlock faction={factions.domination} color="red" />

      <p className="text-xs text-text-muted mt-16 text-center">
        Source: <a href="https://www.scarsofhonor.com/factions" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/factions</a>
      </p>
    </div>
  );
}
