import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';

export const metadata = {
  title: 'News — ScarsDB',
  description: 'Latest Scars of Honor news and updates.',
};

interface NewsPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
}

export default async function NewsPage() {
  const posts = await sanityClient.fetch<NewsPost[]>(
    `*[_type == "newsPost"] | order(publishedAt desc) {
      _id, title, slug, excerpt, publishedAt
    }`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">News</h1>
      <p className="text-text-secondary mb-8">
        Latest updates and announcements for Scars of Honor.
      </p>

      {posts.length === 0 ? (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-12 text-center">
          <p className="text-text-muted">No news posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/news/${post.slug.current}`}
              className="block bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-honor-gold/10 text-honor-gold">
                  News
                </span>
                {post.publishedAt && (
                  <span className="text-xs text-text-muted">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-xl text-parchment mb-2">{post.title}</h2>
              {post.excerpt && (
                <p className="text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
