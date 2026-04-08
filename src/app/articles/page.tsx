import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';

export const metadata = {
  title: 'Articles - ScarsHQ',
  description: 'Guides, lore, and in depth articles about Scars of Honor.',
};

const categoryColors: Record<string, string> = {
  Guide: 'bg-emerald-500/10 text-emerald-400',
  News: 'bg-honor-gold/10 text-honor-gold',
  Lore: 'bg-purple-500/10 text-purple-400',
  'Patch Notes': 'bg-blue-500/10 text-blue-400',
  Opinion: 'bg-orange-500/10 text-orange-400',
};

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  category?: string;
  excerpt?: string;
  publishedAt?: string;
}

export default async function ArticlesPage() {
  const articles = await sanityClient.fetch<Article[]>(
    `*[_type == "article"] | order(publishedAt desc) {
      _id, title, slug, category, excerpt, publishedAt
    }`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Articles</h1>
      <p className="text-text-secondary mb-8">
        Guides, lore deep dives, and in depth analysis of Scars of Honor.
      </p>

      {articles.length === 0 ? (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-12 text-center">
          <p className="text-text-muted">No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/articles/${article.slug.current}`}
              className="block bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-center gap-3 mb-2">
                {article.category && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${categoryColors[article.category] || 'bg-dark-surface text-text-muted'}`}>
                    {article.category}
                  </span>
                )}
                {article.publishedAt && (
                  <span className="text-xs text-text-muted">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-xl text-parchment mb-2">{article.title}</h2>
              {article.excerpt && (
                <p className="text-sm text-text-secondary line-clamp-2">{article.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
