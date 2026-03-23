import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import SanityBody from '@/components/SanityBody';
import type { Metadata } from 'next';

interface PageDoc {
  title: string;
  slug: { current: string };
  excerpt?: string;
  body?: unknown[];
  seo?: { metaTitle?: string; metaDescription?: string };
}

export async function generateStaticParams() {
  const pages = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "page"]{ slug }`
  );
  return pages.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityClient.fetch<PageDoc>(
    `*[_type == "page" && slug.current == $slug][0]{ title, excerpt, seo }`,
    { slug }
  );
  return {
    title: page?.seo?.metaTitle || `${page?.title} — ScarsDB`,
    description: page?.seo?.metaDescription || page?.excerpt || '',
  };
}

export default async function PageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await sanityClient.fetch<PageDoc>(
    `*[_type == "page" && slug.current == $slug][0]{
      title, slug, excerpt, body, seo
    }`,
    { slug }
  );

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Page Not Found</h1>
        <Link href="/pages" className="text-honor-gold hover:text-honor-gold-light">← Back to Pages</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/pages" className="hover:text-honor-gold transition-colors">Info</Link>
        <span>/</span>
        <span className="text-text-secondary">{page.title}</span>
      </nav>

      <article className="bg-card-bg border border-border-subtle rounded-lg p-8">
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-6">{page.title}</h1>

        {page.body ? (
          <SanityBody value={page.body} />
        ) : (
          <p className="text-text-muted">No content yet.</p>
        )}
      </article>

      <Link href="/pages" className="inline-block mt-6 text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Info
      </Link>
    </div>
  );
}
