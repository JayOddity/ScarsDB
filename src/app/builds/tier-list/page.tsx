import type { Metadata } from 'next';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import { classes } from '@/data/classes';

export const metadata: Metadata = {
  title: 'Scars of Honor Class Tier List — Best PvP & PvE Classes | ScarsHQ',
  description:
    'The community Scars of Honor class tier list. Top voted PvP and PvE builds for every class. Updated as playtest data comes in — take early rankings with a grain of salt.',
  alternates: { canonical: 'https://scarshq.com/builds/tier-list' },
  openGraph: {
    title: 'Scars of Honor Class Tier List',
    description:
      'Top voted PvP and PvE builds per class. Community driven tier rankings for Scars of Honor.',
    url: 'https://scarshq.com/builds/tier-list',
    type: 'website',
  },
};

// Revalidate every 5 minutes so new top builds surface without manual redeploy.
export const revalidate = 300;

interface TopBuild {
  code: string;
  classSlug: string;
  name?: string;
  upvotes?: number;
  downvotes?: number;
  tags?: string[];
}

async function fetchTopByTag(tag: 'pvp' | 'pve'): Promise<Record<string, TopBuild | null>> {
  const builds = await sanityClient.fetch<TopBuild[]>(
    `*[_type == "talentBuild" && $tag in tags] | order((coalesce(upvotes,0) - coalesce(downvotes,0)) desc, createdAt desc) [0...200] {
      code, classSlug, name, upvotes, downvotes, tags
    }`,
    { tag } as Record<string, string>,
    { next: { revalidate: 300 } },
  );
  const byClass: Record<string, TopBuild | null> = {};
  for (const cls of classes) {
    byClass[cls.slug] = builds.find((b) => b.classSlug === cls.slug) || null;
  }
  return byClass;
}

export default async function ClassTierListPage() {
  const [pvp, pve] = await Promise.all([fetchTopByTag('pvp'), fetchTopByTag('pve')]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-3">
        Scars of Honor Class Tier List
      </h1>
      <p className="text-text-secondary mb-4 max-w-3xl">
        A community tier list for Scars of Honor classes, driven by the highest voted builds on
        ScarsHQ. We show the single top rated PvP and PvE build for each class so you can see at a
        glance what the community is gravitating toward.
      </p>
      <div className="mb-8 p-4 rounded-lg border border-honor-gold/20 bg-honor-gold/5 max-w-3xl">
        <p className="text-sm text-text-secondary">
          <span className="font-heading text-honor-gold">Heads up:</span> Scars of Honor is still in
          playtest. Any tier list this early is guesswork. These rankings will mean a lot more once
          the Spring 2026 Playtest (April 30 to May 11) produces real combat data and a larger pool
          of builds to vote on. Check back often.
        </p>
      </div>

      <h2 className="font-heading text-xl text-honor-gold mb-4">Highest Rated Builds Per Class</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {([
          { label: 'PvP', tag: 'pvp' as const, data: pvp },
          { label: 'PvE', tag: 'pve' as const, data: pve },
        ]).map(({ label, tag, data }) => (
          <section key={tag} className="rounded-lg border border-border-subtle bg-card-bg overflow-hidden">
            <div className="px-4 py-3 bg-honor-gold/10 border-b border-border-subtle flex items-center justify-between">
              <h3 className="font-heading text-base text-honor-gold">{label}</h3>
              <Link
                href={`/builds/${tag}`}
                className="text-[11px] text-text-muted hover:text-honor-gold transition-colors"
              >
                All {tag.toUpperCase()} builds &rarr;
              </Link>
            </div>
            <ul className="divide-y divide-border-subtle">
              {classes.map((cls) => {
                const build = data[cls.slug];
                const score = build ? (build.upvotes || 0) - (build.downvotes || 0) : 0;
                return (
                  <li key={cls.slug}>
                    {build ? (
                      <Link
                        href={`/builds/view/${build.code}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-honor-gold/5 transition-colors"
                      >
                        <img src={cls.icon} alt={cls.name} className="w-10 h-10 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-heading text-sm text-text-primary truncate">
                            {build.name || 'Unnamed Build'}
                          </div>
                          <div className="text-[11px] text-text-muted">{cls.name}</div>
                        </div>
                        {score > 0 && (
                          <span className="text-xs text-emerald-400 shrink-0">+{score}</span>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 opacity-60">
                        <img src={cls.icon} alt={cls.name} className="w-10 h-10 shrink-0 grayscale" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-text-muted italic">No build yet</div>
                          <div className="text-[11px] text-text-muted">{cls.name}</div>
                        </div>
                        <Link
                          href={`/talents/${cls.slug}`}
                          className="text-[11px] text-honor-gold-dim hover:text-honor-gold shrink-0"
                        >
                          Create &rarr;
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-heading text-xl text-honor-gold mb-3">How this tier list works</h2>
        <p className="text-text-secondary mb-3">
          Instead of a static S/A/B tier grid authored by one person, ScarsHQ uses community voting.
          Every build you see here is a user submitted talent setup that the community has upvoted.
          The single top voted build per class, per game mode, represents the current popular pick.
        </p>
        <p className="text-text-secondary mb-3">
          As the game matures, expect this list to shift dramatically. Playtest balance patches,
          newly discovered synergies, and a wider pool of voters will all move builds up and down.
          If you disagree with a ranking, the fix is easy: build your own and share it.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/talents"
            className="px-5 py-2.5 bg-honor-gold text-void-black font-heading rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Create a build
          </Link>
          <Link
            href="/builds/best"
            className="px-5 py-2.5 bg-honor-gold/10 border border-honor-gold-dim text-honor-gold rounded-lg hover:bg-honor-gold/20 transition-colors"
          >
            See all top rated builds
          </Link>
          <Link
            href="/classes"
            className="px-5 py-2.5 bg-card-bg border border-border-subtle text-text-secondary rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Browse all classes
          </Link>
        </div>
      </section>
    </div>
  );
}
