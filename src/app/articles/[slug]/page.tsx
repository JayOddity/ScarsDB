import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import SanityBody from '@/components/SanityBody';
import type { Metadata } from 'next';

const categoryColors: Record<string, string> = {
  Guide: 'bg-emerald-500/10 text-emerald-400',
  News: 'bg-honor-gold/10 text-honor-gold',
  Lore: 'bg-purple-500/10 text-purple-400',
  'Patch Notes': 'bg-blue-500/10 text-blue-400',
  Opinion: 'bg-orange-500/10 text-orange-400',
};

interface Article {
  title: string;
  slug: { current: string };
  category?: string;
  author?: string;
  excerpt?: string;
  body?: unknown[];
  publishedAt?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

export async function generateStaticParams() {
  const articles = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "article"]{ slug }`
  );
  return articles.map((a) => ({ slug: a.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityClient.fetch<Article>(
    `*[_type == "article" && slug.current == $slug][0]{ title, excerpt, seo }`,
    { slug }
  );
  return {
    title: article?.seo?.metaTitle || `${article?.title} - ScarsHQ`,
    description: article?.seo?.metaDescription || article?.excerpt || '',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await sanityClient.fetch<Article>(
    `*[_type == "article" && slug.current == $slug][0]{
      title, slug, category, author, excerpt, body, publishedAt, seo
    }`,
    { slug }
  );

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Article Not Found</h1>
        <Link href="/articles" className="text-honor-gold hover:text-honor-gold-light">← Back to Articles</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-honor-gold transition-colors">Articles</Link>
        <span>/</span>
        <span className="text-text-secondary">{article.title}</span>
      </nav>

      <article className="bg-card-bg border border-border-subtle rounded-lg p-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {article.category && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${categoryColors[article.category] || 'bg-dark-surface text-text-muted'}`}>
              {article.category}
            </span>
          )}
          {article.publishedAt && (
            <span className="text-sm text-text-muted">
              {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          <span className="text-sm text-text-muted">By <span className="text-text-secondary">{article.author || 'ScarsHQ'}</span></span>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">{article.title}</h1>

        {article.body ? (
          <SanityBody value={article.body} />
        ) : (
          <p className="text-text-muted">No content yet.</p>
        )}
      </article>

      <Link href="/articles" className="inline-block mt-6 text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Articles
      </Link>
    </div>
  );
}
