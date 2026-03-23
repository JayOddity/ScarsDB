import { factions } from '@/data/classes';

export const metadata = {
  title: 'Races & Factions — ScarsDB',
  description: 'Explore the races and factions of Aragon. The Sacred Order vs. The Domination.',
};

export default function RacesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Races & Factions</h1>
      <p className="text-text-secondary mb-12">
        Aragon is divided between two great factions locked in an eternal struggle.
        Your choice of faction and race shapes your journey through the world.
      </p>

      {/* Sacred Order */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">{factions.sacredOrder.name}</h2>
        </div>
        <p className="text-text-secondary mb-6">{factions.sacredOrder.description}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {factions.sacredOrder.races.map((race) => (
            <div key={race.name} className="bg-card-bg border border-border-subtle rounded-lg p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{race.icon}</span>
                <h3 className="font-heading text-lg text-text-primary">{race.name}</h3>
              </div>
              <p className="text-sm text-text-secondary">{race.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Domination */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-scar-red rotate-45" />
          <h2 className="font-heading text-2xl text-scar-red">{factions.domination.name}</h2>
        </div>
        <p className="text-text-secondary mb-6">{factions.domination.description}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {factions.domination.races.map((race) => (
            <div key={race.name} className="bg-card-bg border border-scar-red/20 rounded-lg p-5 hover:border-scar-red/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{race.icon}</span>
                <h3 className="font-heading text-lg text-text-primary">{race.name}</h3>
              </div>
              <p className="text-sm text-text-secondary">{race.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
