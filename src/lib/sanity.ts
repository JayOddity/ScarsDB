import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
});

// Write client (for importing data)
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  logo?: { asset: { _ref: string } };
  defaultSeo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: { asset: { _ref: string } };
  };
  socials?: {
    discord?: string;
    twitter?: string;
    youtube?: string;
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0]{
      siteName,
      siteDescription,
      logo,
      defaultSeo,
      socials
    }`,
    {},
    { next: { revalidate: 300 } }
  );
}
