import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sanityClient } from '@/lib/sanity';
import { classes } from '@/data/classes';
import BuildGuideView from '@/components/BuildGuideView';
import BuildEditButton from '@/components/BuildEditButton';
import BuildPublishControls from '@/components/BuildPublishControls';
import TalentTree from '@/components/TalentTree';
import VoteButton from '@/components/VoteButton';
import BuildViewEquipment from '@/components/BuildViewEquipment';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const dynamic = 'force-dynamic';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const build = await sanityClient.fetch(
    `*[_type == "talentBuild" && code == $code][0]{ name, classSlug, tags, description, isPublic }`,
    { code },
  );
  if (!build) return { title: 'Build Not Found - ScarsHQ' };
  const cls = classMap.get(build.classSlug);
  const tagStr = build.tags?.length ? ` (${build.tags.join(', ')})` : '';
  return {
    title: `${build.name || 'Build'} - ${cls?.name || build.classSlug} Build${tagStr} | ScarsHQ`,
    description: build.description || `A ${cls?.name} talent build for Scars of Honor.`,
    alternates: { canonical: `/builds/view/${code}` },
    robots: build.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function BuildViewPage({ params }: PageProps) {
  const { code } = await params;

  const build = await sanityClient.fetch(
    `*[_type == "talentBuild" && code == $code][0]{
      code, classSlug, allocation, equipment, name, tags, description, guide, patch,
      totalPoints, upvotes, downvotes, createdAt, isPublic, publishedAt,
      "authorName": author->displayName, "authorImage": author->image, "authorRef": author._ref
    }`,
    { code },
  );

  if (!build) notFound();

  const cls = classMap.get(build.classSlug);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Builds', url: '/builds' },
          ...(cls ? [{ name: cls.name, url: `/builds/${cls.slug}` }] : []),
          { name: build.name || build.code, url: `/builds/view/${build.code}` },
        ]}
      />
      {/* Header */}
      <nav className="text-sm text-text-muted mb-4">
        <Link href="/builds" className="hover:text-honor-gold transition-colors">Builds</Link>
        <span className="mx-2">/</span>
        {cls && (
          <>
            <Link href={`/builds/${cls.slug}`} className="hover:text-honor-gold transition-colors">{cls.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-text-secondary">{build.name || build.code}</span>
      </nav>

      <div className="flex items-start gap-4 mb-4">
        <VoteButton buildCode={build.code} initialUpvotes={build.upvotes} initialDownvotes={build.downvotes} />
        {cls && <img src={cls.icon} alt={cls.name} className="w-14 h-14 shrink-0" />}
        <div className="flex-1">
          <h1 className="font-heading text-2xl md:text-3xl text-honor-gold mb-2">
            {build.name || 'Unnamed Build'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {cls && <span>{cls.name}</span>}
            <span>{build.totalPoints} pts</span>
            {build.patch && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">{build.patch}</span>
            )}
            {build.tags?.map((t: string) => (
              <span key={t} className="px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold border border-honor-gold/20 text-xs">
                {t === 'pvp' ? 'PvP' : t === 'pve' ? 'PvE' : t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
            <span>{new Date(build.createdAt).toLocaleDateString()}</span>
            {build.authorName && (
              <span className="flex items-center gap-1.5">
                {build.authorImage && <img src={build.authorImage} alt="" className="w-5 h-5 rounded-full" />}
                <span className="text-text-secondary">{build.authorName}</span>
              </span>
            )}
            <span className="font-mono text-xs">{build.code}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href={`/talents/${build.classSlug}?build=${build.code}`}
            className="px-5 py-2.5 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-center text-sm"
          >
            Open in Talent Calculator
          </Link>
          <BuildEditButton buildCode={build.code} authorRef={build.authorRef} />
          <BuildPublishControls buildCode={build.code} authorRef={build.authorRef} initialIsPublic={!!build.isPublic} />
        </div>
      </div>

      {!build.isPublic && (
        <div className="mb-6 bg-card-bg border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-muted flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-text-muted/10 text-text-secondary text-xs uppercase tracking-wider">Private</span>
          <span>Only people with this link can see this build. It won&apos;t appear in /builds.</span>
        </div>
      )}

      {/* Description */}
      {build.description && (
        <p className="text-text-secondary mb-8 max-w-3xl">{build.description}</p>
      )}

      {/* 1. Talent Tree Embed */}
      <section className="mb-14">
        <div className="diamond-divider mb-6"><span className="diamond" /></div>
        <h2 className="font-heading text-xl text-honor-gold mb-4">Talent Tree</h2>
        <div className="relative">
          <div className="bg-[#0d0d0d] border border-border-subtle rounded-lg overflow-visible" style={{ height: '600px', clipPath: 'inset(-30px -0px -30px -0px)' }}>
            {cls && <TalentTree gameClass={cls} readOnly initialAllocation={build.allocation} buildCode={build.code} />}
          </div>
        </div>
      </section>

      {/* 2. Equipment */}
      <section className="mb-8">
        <div className="diamond-divider mb-6"><span className="diamond" /></div>
        <h2 className="font-heading text-xl text-honor-gold mb-4">Equipment</h2>
        {build.equipment ? (
          <BuildViewEquipment equipmentJson={build.equipment} />
        ) : (
          <p className="text-sm text-text-muted bg-card-bg border border-border-subtle rounded-lg p-5">No equipment specified for this build.</p>
        )}
      </section>

      {/* 3. Skills */}
      <section className="mb-8">
        <div className="diamond-divider mb-6"><span className="diamond" /></div>
        <h2 className="font-heading text-xl text-honor-gold mb-4">Skills</h2>
        <p className="text-sm text-text-muted bg-card-bg border border-border-subtle rounded-lg p-5">Skills data coming soon.</p>
      </section>

      {/* 4. Scars */}
      <section className="mb-8">
        <div className="diamond-divider mb-6"><span className="diamond" /></div>
        <h2 className="font-heading text-xl text-honor-gold mb-4">Scars</h2>
        <p className="text-sm text-text-muted bg-card-bg border border-border-subtle rounded-lg p-5">Scars data coming soon.</p>
      </section>

      {/* 5. Full Guide */}
      {build.guide && (
        <section className="mb-8">
          <div className="diamond-divider mb-6"><span className="diamond" /></div>
          <h2 className="font-heading text-xl text-honor-gold mb-4">Build Guide</h2>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <BuildGuideView markdown={build.guide} />
          </div>
        </section>
      )}

      {/* Build code footer */}
      <div className="mt-12 bg-card-bg border border-border-subtle rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted block mb-1">Build Code</span>
            <span className="text-lg font-mono text-honor-gold">{build.code}</span>
          </div>
          <Link
            href={`/talents/${build.classSlug}?build=${build.code}`}
            className="px-4 py-2 bg-honor-gold/10 border border-honor-gold-dim rounded-lg text-sm text-honor-gold hover:bg-honor-gold/20 transition-colors"
          >
            Load in Talent Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}

