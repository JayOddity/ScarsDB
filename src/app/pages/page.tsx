import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';

export const metadata = {
  title: 'Pages — ScarsDB',
  description: 'General information pages for the Scars of Honor fan site.',
};

interface PageDoc {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
}

export default async function PagesIndex() {
  const pages = await sanityClient.fetch<PageDoc[]>(
    `*[_type == "page"] | order(title asc) {
      _id, title, slug, excerpt
    }`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Info</h1>
      <p className="text-text-secondary mb-8">
        General information about the site and Scars of Honor.
      </p>

      {pages.length === 0 ? (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-12 text-center">
          <p className="text-text-muted">No pages yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <Link
              key={page._id}
              href={`/pages/${page.slug.current}`}
              className="block bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <h2 className="font-heading text-lg text-parchment mb-2">{page.title}</h2>
              {page.excerpt && (
                <p className="text-sm text-text-secondary line-clamp-2">{page.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
