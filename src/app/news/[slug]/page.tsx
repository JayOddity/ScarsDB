import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import SanityBody from '@/components/SanityBody';
import type { Metadata } from 'next';

interface NewsPost {
  title: string;
  slug: { current: string };
  excerpt?: string;
  body?: unknown[];
  publishedAt?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

export async function generateStaticParams() {
  const posts = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "newsPost"]{ slug }`
  );
  return posts.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityClient.fetch<NewsPost>(
    `*[_type == "newsPost" && slug.current == $slug][0]{ title, seo }`,
    { slug }
  );
  return {
    title: post?.seo?.metaTitle || `${post?.title} - ScarsHQ`,
    description: post?.seo?.metaDescription || post?.excerpt || '',
  };
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await sanityClient.fetch<NewsPost>(
    `*[_type == "newsPost" && slug.current == $slug][0]{
      title, slug, excerpt, body, publishedAt, seo
    }`,
    { slug }
  );

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Post Not Found</h1>
        <Link href="/news" className="text-honor-gold hover:text-honor-gold-light">← Back to News</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-honor-gold transition-colors">News</Link>
        <span>/</span>
        <span className="text-text-secondary">{post.title}</span>
      </nav>

      <article className="bg-card-bg border border-border-subtle rounded-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-honor-gold/10 text-honor-gold">News</span>
          {post.publishedAt && (
            <span className="text-sm text-text-muted">
              {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">{post.title}</h1>

        {post.body ? (
          <SanityBody value={post.body} />
        ) : (
          <p className="text-text-muted">No content yet.</p>
        )}
      </article>

      <Link href="/news" className="inline-block mt-6 text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to News
      </Link>
    </div>
  );
}
