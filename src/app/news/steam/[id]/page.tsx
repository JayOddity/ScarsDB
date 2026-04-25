import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSteamPost } from '@/lib/steamNews';
import SteamPostBody from '@/components/SteamPostBody';

export const revalidate = 300;

function stripSteamMarkup(text: string): string {
  return text
    .replace(/\[previewyoutube[^\]]*\]\s*\[\/previewyoutube\]/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\{STEAM_CLAN_IMAGE\}[^\s"]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getSteamPost(id);
  if (!post) return { title: 'Post Not Found - ScarsHQ' };

  const description = stripSteamMarkup(post.contents).slice(0, 160);

  return {
    title: `${post.title} - ScarsHQ`,
    description,
    alternates: { canonical: post.url },
    openGraph: {
      title: post.title,
      description,
      url: `https://scarshq.com/news/steam/${id}`,
      type: 'article',
      publishedTime: new Date(post.date * 1000).toISOString(),
    },
  };
}

export default async function SteamNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getSteamPost(id);

  if (!post) notFound();

  const publishedAt = new Date(post.date * 1000);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <span className="text-text-secondary">{post.title}</span>
      </nav>

      <article className="bg-card-bg border border-border-subtle rounded-lg p-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400">Steam</span>
          <span className="text-sm text-text-muted">
            {publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {post.author && <span className="text-sm text-text-muted">by {post.author}</span>}
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">{post.title}</h1>

        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mb-6 text-sm text-honor-gold hover:text-honor-gold-light transition-colors"
        >
          View original on Steam ↗
        </a>

        <SteamPostBody contents={post.contents} />

        <div className="mt-8 pt-6 border-t border-border-subtle flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
            ← Back to Home
          </Link>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-honor-gold transition-colors"
          >
            Originally posted on Steam ↗
          </a>
        </div>
      </article>
    </div>
  );
}
