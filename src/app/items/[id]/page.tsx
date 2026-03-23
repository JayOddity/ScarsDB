import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import type { Item } from '@/lib/api';

const rarityColorClass: Record<string, string> = {
  Common: 'rarity-common',
  Rare: 'rarity-rare',
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
};
const rarityBorderClass: Record<string, string> = {
  Common: 'rarity-border-common',
  Rare: 'rarity-border-rare',
  Epic: 'rarity-border-epic',
  Legendary: 'rarity-border-legendary',
};

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let item: Item;
  try {
    item = await sanityClient.fetch<Item>(
      `*[_type == "item" && externalId == $id][0] {
        "id": externalId,
        name,
        "type": itemType,
        rarity,
        icon,
        "slot_type": slotType,
        "stack_size": stackSize,
        "sell_value": sellValue,
        "is_destructible": isDestructible,
        "updated_at": _updatedAt,
        "stat_configuration": select(
          defined(stats) && length(stats) > 0 => {
            "lists": [{
              "min_stat_count": 1,
              "max_stat_count": count(stats),
              "modifications": stats[] {
                "stat": stat,
                "modif_type": modifType,
                "modif_weight": modifWeight,
                "modif_min_value": minValue,
                "modif_max_value": maxValue
              }
            }]
          },
          null
        )
      }`,
      { id }
    );
    if (!item) throw new Error('Not found');
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Item Not Found</h1>
        <p className="text-text-secondary mb-4">This item could not be found in the database.</p>
        <Link href="/items" className="text-honor-gold hover:text-honor-gold-light">← Back to Item Database</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/items" className="hover:text-honor-gold transition-colors">Items</Link>
        <span>/</span>
        <span className={rarityColorClass[item.rarity]}>{item.name}</span>
      </nav>

      {/* Item Header */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className={`w-20 h-20 rounded-lg border-2 ${rarityBorderClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0`}>
            {item.icon && !item.icon.includes('placehold') ? (
              <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-text-muted">?</span>
            )}
          </div>
          <div>
            <h1 className={`font-heading text-2xl md:text-3xl mb-2 ${rarityColorClass[item.rarity]}`}>
              {item.name}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-2 py-1 rounded bg-dark-surface text-text-secondary">{item.type}</span>
              <span className={`px-2 py-1 rounded bg-dark-surface ${rarityColorClass[item.rarity]}`}>{item.rarity}</span>
              {item.slot_type && (
                <span className="px-2 py-1 rounded bg-dark-surface text-text-secondary">{item.slot_type}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {item.stat_configuration?.lists?.length ? (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Stat Configuration</h2>
          {item.stat_configuration.lists.map((list, li) => (
            <div key={li} className="mb-4 last:mb-0">
              <p className="text-xs text-text-muted mb-2">
                Rolls {list.min_stat_count}–{list.max_stat_count} stats from this pool:
              </p>
              <div className="space-y-2">
                {list.modifications.map((mod, mi) => {
                  const min = parseFloat(mod.modif_min_value);
                  const max = parseFloat(mod.modif_max_value);
                  return (
                    <div key={mi} className="flex items-center justify-between py-2 px-4 bg-dark-surface/50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-primary font-medium">{mod.stat}</span>
                        <span className="text-xs text-text-muted">{mod.modif_type}</span>
                      </div>
                      <span className="text-sm text-honor-gold font-medium">
                        {min === max ? `+${min}` : `+${min} – ${max}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Info */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
        <h2 className="font-heading text-lg text-honor-gold mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Sell Value</span>
            <p className="text-text-primary">{item.sell_value > 0 ? `${item.sell_value} gold` : 'Cannot be sold'}</p>
          </div>
          <div>
            <span className="text-text-muted">Stack Size</span>
            <p className="text-text-primary">{item.stack_size}</p>
          </div>
          <div>
            <span className="text-text-muted">Destructible</span>
            <p className="text-text-primary">{item.is_destructible ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <span className="text-text-muted">Last Updated</span>
            <p className="text-text-primary">{new Date(item.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Link href="/items" className="text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Item Database
      </Link>
    </div>
  );
}
