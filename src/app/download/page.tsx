import type { Metadata } from 'next';
import DownloadContent from './DownloadContent';

export const metadata: Metadata = {
  title: 'Scars of Honor Download Guide - Free on Steam (2026) | ScarsHQ',
  description: 'Step by step guide to download Scars of Honor on Steam. Playtest access, dates, system requirements, and what to do while you wait. Free to play, no key required. Next playtest: April 30 - May 11, 2026.',
  openGraph: {
    title: 'Scars of Honor Download Guide - Free on Steam',
    description: 'Step by step guide to playtest access, dates, and what to do while you wait. Next playtest: April 30 - May 11, 2026.',
    url: '/download',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-download.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor download guide - free to play on Steam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Download Guide - Free on Steam',
    description: 'Step by step guide to playtest access, dates, and what to do while you wait. Next playtest: April 30 - May 11, 2026.',
    images: ['/images/og-download.jpg'],
  },
  alternates: {
    canonical: '/download',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Scars of Honor',
  description: 'Free to play fantasy MMORPG. Available on Steam. Request playtest access to join the next Technical Alpha.',
  image: 'https://scarshq.com/images/og-download.jpg',
  gamePlatform: 'PC',
  applicationCategory: 'Game',
  genre: 'MMORPG',
  operatingSystem: 'Windows',
  url: 'https://scarshq.com/download',
  downloadUrl: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  installUrl: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/PreOrder',
    url: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Beastburst Entertainment',
  },
};

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DownloadContent />
    </>
  );
}
