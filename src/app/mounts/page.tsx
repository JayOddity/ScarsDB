import { mounts } from '@/data/mounts';

export const metadata = {
  title: 'Mounts — ScarsDB',
  description: 'All mounts in Scars of Honor. Ground mounts, flying mounts, and how to obtain them.',
};

const rarityColorClass: Record<string, string> = {
  Common: 'rarity-common',
  Rare: 'rarity-rare',
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
};

export default function MountsPage() {
  const ground = mounts.filter((m) => m.type === 'Ground');
  const flying = mounts.filter((m) => m.type === 'Flying');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Mounts</h1>
      <p className="text-text-secondary mb-12 max-w-3xl">
        Traverse the vast lands of Aragon in style. Mounts increase your movement speed and
        can be earned through vendors, reputation, dungeons, PvP, and rare world drops.
      </p>

      {/* Ground Mounts */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">Ground Mounts</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ground.map((mount) => (
            <div
              key={mount.name}
              className="bg-card-bg border border-border-subtle rounded-lg p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mount.icon}</span>
                  <div>
                    <h3 className={`font-heading text-base ${rarityColorClass[mount.rarity]}`}>{mount.name}</h3>
                    <span className={`text-xs ${rarityColorClass[mount.rarity]}`}>{mount.rarity}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400">{mount.speed}</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">{mount.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-dark-surface text-text-muted">
                  📍 {mount.source}
                </span>
                {mount.faction && (
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    mount.faction === 'Sacred Order' ? 'bg-honor-gold/10 text-honor-gold' : 'bg-scar-red/10 text-scar-red-light'
                  }`}>
                    {mount.faction}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Flying Mounts */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-rarity-epic rotate-45" />
          <h2 className="font-heading text-2xl text-rarity-epic">Flying Mounts</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flying.map((mount) => (
            <div
              key={mount.name}
              className="bg-card-bg border border-border-subtle rounded-lg p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mount.icon}</span>
                  <div>
                    <h3 className={`font-heading text-base ${rarityColorClass[mount.rarity]}`}>{mount.name}</h3>
                    <span className={`text-xs ${rarityColorClass[mount.rarity]}`}>{mount.rarity}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400">{mount.speed}</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">{mount.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-dark-surface text-text-muted">
                  📍 {mount.source}
                </span>
                {mount.faction && (
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    mount.faction === 'Sacred Order' ? 'bg-honor-gold/10 text-honor-gold' : 'bg-scar-red/10 text-scar-red-light'
                  }`}>
                    {mount.faction}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Speed comparison */}
      <section className="mt-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-6">Speed Comparison</h2>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
          <div className="space-y-3">
            {['+40%', '+60%', '+80%', '+100%', '+150%', '+200%'].map((speed) => {
              const matchingMounts = mounts.filter((m) => m.speed === speed);
              if (matchingMounts.length === 0) return null;
              const percentage = parseInt(speed) / 2;
              return (
                <div key={speed} className="flex items-center gap-4">
                  <span className="text-sm text-honor-gold font-mono w-12 text-right">{speed}</span>
                  <div className="flex-1 h-6 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-honor-gold-dim to-honor-gold rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-[9px] text-void-black font-bold whitespace-nowrap">
                        {matchingMounts.map((m) => m.icon).join(' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-32 truncate">
                    {matchingMounts.map((m) => m.name).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
