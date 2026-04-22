import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import type { Item } from '@/lib/api';
import TrackView from '@/components/TrackView';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { classes } from '@/data/classes';
import { rarityColorClass, rarityBorderClass } from '@/lib/rarityStyles';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface BuildMatch {
  code: string;
  classSlug: string;
  name?: string;
  upvotes?: number;
  downvotes?: number;
  tags?: string[];
  equipment?: string;
}

// Equipment is stored as a JSON string on talentBuild, so GROQ can't filter
// by itemId server-side without a schema change.
async function fetchBuildsUsingItem(itemId: string): Promise<BuildMatch[]> {
  const builds = await sanityClient.fetch<BuildMatch[]>(
    `*[_type == "talentBuild" && defined(equipment) && equipment != ""] {
      code, classSlug, name, upvotes, downvotes, tags, equipment
    }`,
    {},
    { next: { revalidate: 300, tags: ['talentBuild'] } },
  );
  const matching = builds.filter((b) => {
    if (!b.equipment) return false;
    try {
      const eq = JSON.parse(b.equipment) as Record<string, string>;
      return Object.values(eq).includes(itemId);
    } catch {
      return false;
    }
  });
  matching.sort(
    (a, b) =>
      ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)),
  );
  return matching.slice(0, 6);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await sanityClient.fetch<{ name?: string; rarity?: string; itemType?: string } | null>(
    `*[_type == "item" && slug.current == $slug][0]{ name, rarity, itemType }`,
    { slug },
  );
  if (!item?.name) return { title: 'Item - ScarsHQ' };
  const rarity = item.rarity ? `${item.rarity} ` : '';
  const type = item.itemType ? ` ${item.itemType}` : '';
  return {
    title: `${item.name} - ${rarity}Scars of Honor${type} | ScarsHQ`,
    description: `${item.name} — ${rarity}${item.itemType || 'item'} in Scars of Honor. View stats, rarity, and related builds.`,
    alternates: { canonical: `/database/${slug}` },
  };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let item: Item;
  try {
    item = await sanityClient.fetch<Item>(
      `*[_type == "item" && slug.current == $slug][0] {
        "id": externalId,
        "slug": slug.current,
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
          defined(statLists) && length(statLists) > 0 => {
            "lists": statLists[] {
              "min_stat_count": minStatCount,
              "max_stat_count": maxStatCount,
              "modifications": modifications[] {
                "stat": stat,
                "modif_type": modifType,
                "modif_weight": modifWeight,
                "modif_min_value": minValue,
                "modif_max_value": maxValue
              }
            }
          },
          null
        )
      }`,
      { slug }
    );
    if (!item) throw new Error('Not found');
  } catch {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Item Not Found</h1>
        <p className="text-text-secondary mb-4">This item could not be found in the database.</p>
        <Link href="/database" className="text-honor-gold hover:text-honor-gold-light">← Back to Item Database</Link>
      </div>
    );
  }

  const buildsUsing = await fetchBuildsUsingItem(item.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Database', url: '/database' },
          { name: item.name, url: `/database/${slug}` },
        ]}
      />
      <TrackView itemId={item.id} />
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/database" className="hover:text-honor-gold transition-colors">Database</Link>
        <span>/</span>
        <span className={rarityColorClass[item.rarity]}>{item.name}</span>
      </nav>

      {/* Item Header */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className={`w-20 h-20 rounded-lg border-2 ${rarityBorderClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0`}>
            {item.icon && !item.icon.includes('placehold') ? (
              <Image src={item.icon} alt={item.name} width={80} height={80} className="object-cover" />
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

      {/* Stat Pools */}
      {item.stat_configuration?.lists?.length ? (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Stat Configuration</h2>
          {item.stat_configuration.lists.map((list, li) => {
            const poolLabel = ['Base Stats', 'Stat Pool 2', 'Stat Pool 3', 'Stat Pool 4'][li] || `Stat Pool ${li + 1}`;
            const poolBarColor = ['bg-honor-gold', 'bg-rarity-rare', 'bg-rarity-epic', 'bg-rarity-legendary'][li] || 'bg-honor-gold';
            const poolBarDim = ['bg-honor-gold/30', 'bg-rarity-rare/30', 'bg-rarity-epic/30', 'bg-rarity-legendary/30'][li] || 'bg-honor-gold/30';

            // Combine weapon damage
            const minDmg = list.modifications.find((m) => m.stat === 'Weapon Min Damage');
            const maxDmg = list.modifications.find((m) => m.stat === 'Weapon Max Damage');
            const rest = list.modifications.filter((m) => m.stat !== 'Weapon Min Damage' && m.stat !== 'Weapon Max Damage');

            type ProcessedStat = { label: string; min: number; max: number; type: string };
            const processed: ProcessedStat[] = [];

            if (minDmg && maxDmg) {
              processed.push({
                label: 'Damage',
                min: parseFloat(minDmg.modif_min_value) || 0,
                max: parseFloat(maxDmg.modif_max_value) || 0,
                type: 'Flat',
              });
            } else {
              if (minDmg) rest.unshift(minDmg);
              if (maxDmg) rest.unshift(maxDmg);
            }

            for (const mod of rest) {
              processed.push({
                label: mod.stat,
                min: parseFloat(mod.modif_min_value) || 0,
                max: parseFloat(mod.modif_max_value) || 0,
                type: mod.modif_type,
              });
            }

            const maxVal = Math.max(...processed.map((s) => s.max), 1);

            return (
              <div key={li} className={`${li > 0 ? 'mt-5 pt-5 border-t border-border-subtle/50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary font-medium">{poolLabel}</span>
                  <span className="text-xs text-text-muted">
                    {list.min_stat_count === list.max_stat_count
                      ? `${list.min_stat_count} fixed`
                      : `Rolls ${list.min_stat_count}–${list.max_stat_count}`}
                  </span>
                </div>
                <div className="space-y-2">
                  {processed.map((stat, si) => {
                    const fillPercent = (stat.max / maxVal) * 100;
                    const minPercent = (stat.min / maxVal) * 100;
                    return (
                      <div key={si}>
                        <div className="flex items-center justify-between py-2 px-4 bg-dark-surface/50 rounded-t">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-text-primary font-medium">{stat.label}</span>
                            <span className="text-xs text-text-muted">{stat.type}</span>
                          </div>
                          <span className="text-sm text-honor-gold font-medium">
                            {stat.min === stat.max ? `+${stat.min}` : `${stat.min} – ${stat.max}`}
                          </span>
                        </div>
                        <div className="px-4 pb-2 bg-dark-surface/50 rounded-b">
                          <div className="h-1.5 bg-void-black/50 rounded-full overflow-hidden relative">
                            <div className={`absolute inset-y-0 left-0 ${poolBarDim} rounded-full`} style={{ width: `${fillPercent}%` }} />
                            <div className={`absolute inset-y-0 left-0 ${poolBarColor} rounded-full`} style={{ width: `${minPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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

      {buildsUsing.length > 0 && (
        <section className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-honor-gold">Builds using this item</h2>
            <Link href="/builds" className="text-xs text-text-muted hover:text-honor-gold transition-colors">
              All builds &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {buildsUsing.map((build) => {
              const cls = classMap.get(build.classSlug);
              const score = (build.upvotes || 0) - (build.downvotes || 0);
              return (
                <Link
                  key={build.code}
                  href={`/builds/view/${build.code}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-dark-surface/50 hover:border-honor-gold-dim transition-colors"
                >
                  {cls && <img src={cls.icon} alt={cls.name} className="w-10 h-10 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-sm text-text-primary truncate">
                      {build.name || 'Unnamed Build'}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span>{cls?.name}</span>
                      {build.tags?.map((t) => (
                        <span key={t}>{t === 'pvp' ? 'PvP' : t === 'pve' ? 'PvE' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                      ))}
                    </div>
                  </div>
                  {score > 0 && (
                    <span className="text-xs text-emerald-400 shrink-0">+{score}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Link href="/database" className="text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Item Database
      </Link>
    </div>
  );
}
