import Link from 'next/link';
import { classes, factions } from '@/data/classes';
import { devPosts } from '@/data/devTracker';
import { sanityClient } from '@/lib/sanity';

interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  category?: string;
  excerpt?: string;
  publishedAt?: string;
  _type: string;
}

export default async function HomePage() {
  const featuredPosts = devPosts.slice(0, 3);

  // Fetch latest news and articles from Sanity
  const [latestNews, latestArticles] = await Promise.all([
    sanityClient.fetch<SanityPost[]>(
      `*[_type == "newsPost"] | order(publishedAt desc) [0...3] { _id, title, slug, excerpt, publishedAt, _type }`
    ),
    sanityClient.fetch<SanityPost[]>(
      `*[_type == "article"] | order(publishedAt desc) [0...3] { _id, title, slug, category, excerpt, publishedAt, _type }`
    ),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-surface/50 to-void-black" />
        <div className="relative max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-honor-gold rounded-lg flex items-center justify-center text-void-black font-bold font-heading text-2xl mx-auto mb-6">
            SD
          </div>
          <h1 className="font-heading text-4xl md:text-6xl text-honor-gold mb-4">
            ScarsDB
          </h1>
          <p className="font-heading text-xl md:text-2xl text-parchment mb-2">
            Scars of Honor Database &amp; Tools
          </p>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Your community-first command center for Scars of Honor builds, talent trees,
            skills, items, and progression. Plan your path through Aragon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/talents"
              className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Talent Calculator
            </Link>
            <Link
              href="/items"
              className="px-8 py-3 border border-honor-gold text-honor-gold font-heading font-semibold rounded-lg hover:bg-honor-gold/10 transition-colors"
            >
              Item Database
            </Link>
          </div>
        </div>
      </section>

      {/* Dev Tracker Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">
          Latest Dev Updates
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded"
                  style={{ backgroundColor: post.categoryColor + '20', color: post.categoryColor }}
                >
                  {post.category}
                </span>
                <span className="text-xs text-text-muted">{post.date}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-4">
                &ldquo;{post.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center text-xs text-honor-gold font-bold">
                  BB
                </div>
                <div>
                  <p className="text-xs text-text-primary font-medium">{post.author}</p>
                  <p className="text-xs text-text-muted">{post.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/tracker" className="text-honor-gold hover:text-honor-gold-light text-sm font-medium transition-colors">
            Read More Dev Updates →
          </Link>
        </div>
      </section>

      {/* Latest News & Articles */}
      {(latestNews.length > 0 || latestArticles.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="diamond-divider mb-8">
            <span className="diamond" />
          </div>
          <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">
            Latest News &amp; Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* News column */}
            <div>
              <h3 className="font-heading text-lg text-parchment mb-4 flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-honor-gold/10 text-honor-gold">News</span>
              </h3>
              {latestNews.length > 0 ? (
                <div className="space-y-3">
                  {latestNews.map((post) => (
                    <Link key={post._id} href={`/news/${post.slug.current}`}
                      className="block bg-card-bg border border-border-subtle rounded-lg p-4 hover:border-honor-gold-dim transition-colors glow-gold-hover">
                      <h4 className="text-sm font-medium text-text-primary mb-1">{post.title}</h4>
                      {post.excerpt && <p className="text-xs text-text-muted line-clamp-2">{post.excerpt}</p>}
                      {post.publishedAt && (
                        <span className="text-xs text-text-muted mt-1 block">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No news yet.</p>
              )}
              <Link href="/news" className="text-honor-gold hover:text-honor-gold-light text-xs font-medium mt-3 inline-block transition-colors">
                All News →
              </Link>
            </div>
            {/* Articles column */}
            <div>
              <h3 className="font-heading text-lg text-parchment mb-4 flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Articles</span>
              </h3>
              {latestArticles.length > 0 ? (
                <div className="space-y-3">
                  {latestArticles.map((post) => (
                    <Link key={post._id} href={`/articles/${post.slug.current}`}
                      className="block bg-card-bg border border-border-subtle rounded-lg p-4 hover:border-honor-gold-dim transition-colors glow-gold-hover">
                      <h4 className="text-sm font-medium text-text-primary mb-1">{post.title}</h4>
                      {post.excerpt && <p className="text-xs text-text-muted line-clamp-2">{post.excerpt}</p>}
                      {post.publishedAt && (
                        <span className="text-xs text-text-muted mt-1 block">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No articles yet.</p>
              )}
              <Link href="/articles" className="text-honor-gold hover:text-honor-gold-light text-xs font-medium mt-3 inline-block transition-colors">
                All Articles →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Factions & Races */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">
          Factions &amp; Races of Aragon
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h3 className="font-heading text-xl text-honor-gold mb-2">{factions.sacredOrder.name}</h3>
            <p className="text-sm text-text-secondary mb-4">{factions.sacredOrder.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {factions.sacredOrder.races.map((race) => (
                <div key={race.name} className="flex items-center gap-2 p-2 rounded bg-dark-surface/50">
                  <span className="text-xl">{race.icon}</span>
                  <div>
                    <p className="text-sm text-text-primary font-medium">{race.name}</p>
                    <p className="text-xs text-text-muted">{race.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card-bg border border-scar-red/30 rounded-lg p-6">
            <h3 className="font-heading text-xl text-scar-red mb-2">{factions.domination.name}</h3>
            <p className="text-sm text-text-secondary mb-4">{factions.domination.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {factions.domination.races.map((race) => (
                <div key={race.name} className="flex items-center gap-2 p-2 rounded bg-dark-surface/50">
                  <span className="text-xl">{race.icon}</span>
                  <div>
                    <p className="text-sm text-text-primary font-medium">{race.name}</p>
                    <p className="text-xs text-text-muted">{race.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">
          10 Classes, No Subclasses — Your Build, Your Way
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {classes.map((cls) => (
            <Link
              key={cls.slug}
              href={`/classes/${cls.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-card-bg border border-border-subtle rounded-lg hover:border-honor-gold-dim transition-colors glow-gold-hover group"
            >
              <span className="text-3xl">{cls.icon}</span>
              <span className="text-sm font-heading text-text-primary group-hover:text-honor-gold transition-colors">
                {cls.name}
              </span>
              <span className="text-xs text-text-muted">{cls.role}</span>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/classes" className="text-honor-gold hover:text-honor-gold-light text-sm font-medium transition-colors">
            Explore All Classes →
          </Link>
        </div>
      </section>

      {/* Playtest CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card-bg border border-honor-gold/30 rounded-lg p-8 text-center glow-gold">
          <h2 className="font-heading text-2xl text-honor-gold mb-2">Spring 2026 Playtest</h2>
          <p className="text-lg text-parchment mb-1">April 30 — May 11, 2026</p>
          <p className="text-sm text-text-secondary mb-6">
            4 classes, 4 races, dungeons, PvP, and full talent trees. Wishlist on Steam to play.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Wishlist on Steam
            </a>
            <Link
              href="/playtest"
              className="px-6 py-3 border border-honor-gold text-honor-gold font-heading font-semibold rounded-lg hover:bg-honor-gold/10 transition-colors"
            >
              Playtest Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
