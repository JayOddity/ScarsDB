import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import type { Item } from '@/lib/api';
import { ITEM_PROJECTION } from '@/lib/itemQueries';
import TrackView from '@/components/TrackView';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ItemTooltipPanel from '@/components/ItemTooltipPanel';
import { classes } from '@/data/classes';
import { rarityColorClass } from '@/lib/rarityStyles';

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
    // Reuse the same projection as /api/items so the detail page reads from the
    // populated `stats[]` field (the schema's `statLists[]` is empty for every
    // item — it was added later but never backfilled). This also keeps the
    // shape identical to what the hover panel renders.
    item = await sanityClient.fetch<Item & { updated_at?: string }>(
      `*[_type == "item" && slug.current == $slug][0] ${ITEM_PROJECTION.replace(/\}$/, ', "updated_at": _updatedAt }')}`,
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

      <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
        {/* Left column: in-game tooltip card. Sticks on lg+ so it stays visible while scrolling the right side. */}
        <aside className="lg:sticky lg:top-24">
          <ItemTooltipPanel item={item} linkable={false} size="lg" />
        </aside>

        {/* Right column: meta details + builds using this item. Header/stats live in the tooltip on the left. */}
        <div>
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
      </div>
    </div>
  );
}
