import Link from 'next/link';
import { professions } from '@/data/professions';

export const metadata = {
  title: 'Professions - ScarsHQ',
  description: 'Gathering and crafting professions in Scars of Honor. Mining, Herbalism, Blacksmithing, Alchemy, and more.',
  alternates: { canonical: '/professions' },
};

export default function ProfessionsPage() {
  const gathering = professions.filter((p) => p.type === 'Gathering');
  const crafting = professions.filter((p) => p.type === 'Crafting');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Professions</h1>
      <p className="text-text-secondary mb-12 max-w-6xl">
        Scars of Honor has a crafting and gathering system with multiple professions. Details on
        specific mechanics are still being revealed, but gathering and crafting are both confirmed
        as part of the game.
      </p>

      {/* Gathering */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-green-500 rotate-45" />
          <h2 className="font-heading text-2xl text-green-400">Gathering Professions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {gathering.map((prof) => (
            <div key={prof.slug} id={prof.slug} className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-green-500/30 transition-colors glow-gold-hover scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 gem-bullet shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-text-primary">{prof.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400">Gathering</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4">{prof.details}</p>
              <div className="mb-3">
                <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Produces</p>
                <div className="flex flex-wrap gap-1">
                  {prof.produces.map((item) => (
                    <span key={item} className="text-xs px-2 py-0.5 rounded bg-dark-surface text-text-secondary">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Synergies</p>
                <div className="flex flex-wrap gap-1">
                  {prof.synergies.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Crafting */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 gem-bullet" />
          <h2 className="font-heading text-2xl text-honor-gold">Crafting Professions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {crafting.map((prof) => (
            <div key={prof.slug} id={prof.slug} className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 gem-bullet shrink-0" />
                <div>
                  <h3 className="font-heading text-lg text-text-primary">{prof.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold">Crafting</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4">{prof.details}</p>
              <div className="mb-3">
                <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Produces</p>
                <div className="flex flex-wrap gap-1">
                  {prof.produces.map((item) => (
                    <span key={item} className="text-xs px-2 py-0.5 rounded bg-dark-surface text-text-secondary">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">Synergies</p>
                <div className="flex flex-wrap gap-1">
                  {prof.synergies.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profession Synergy Chart */}
      <section className="mt-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-6">Profession Synergy Chart</h2>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 px-3 text-text-muted font-medium">Gathering</th>
                <th className="text-center py-2 px-3 text-text-muted font-medium">→</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Crafting</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Key Output</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 px-3 text-text-secondary">⛏️ Mining</td>
                <td className="py-2 px-3 text-center text-honor-gold">→</td>
                <td className="py-2 px-3 text-text-secondary">🔨 Blacksmithing</td>
                <td className="py-2 px-3 text-text-muted">Plate Armor, Weapons, Shields</td>
              </tr>
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 px-3 text-text-secondary">🌿 Herbalism</td>
                <td className="py-2 px-3 text-center text-honor-gold">→</td>
                <td className="py-2 px-3 text-text-secondary">⚗️ Alchemy</td>
                <td className="py-2 px-3 text-text-muted">Potions, Flasks, Poisons</td>
              </tr>
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 px-3 text-text-secondary">🔪 Skinning</td>
                <td className="py-2 px-3 text-center text-honor-gold">→</td>
                <td className="py-2 px-3 text-text-secondary">🧵 Leatherworking</td>
                <td className="py-2 px-3 text-text-muted">Leather Armor, Cloaks, Bags</td>
              </tr>
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 px-3 text-text-secondary">🪓 Woodcutting</td>
                <td className="py-2 px-3 text-center text-honor-gold">→</td>
                <td className="py-2 px-3 text-text-secondary">✨ Enchanting</td>
                <td className="py-2 px-3 text-text-muted">Enchants, Runes, Scrolls</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
