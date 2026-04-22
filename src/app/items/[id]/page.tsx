import { notFound, permanentRedirect } from 'next/navigation';
import { sanityClient } from '@/lib/sanity';

export default async function ItemIdRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await sanityClient.fetch<{ slug?: string } | null>(
    `*[_type == "item" && externalId == $id][0]{ "slug": slug.current }`,
    { id },
  );
  if (!item?.slug) notFound();
  permanentRedirect(`/database/${item.slug}`);
}
