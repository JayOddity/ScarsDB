import type { Metadata } from 'next';
import DownloadContent from './DownloadContent';

export const metadata: Metadata = {
  title: 'Download Scars of Honor: Free on Steam, Playtest Live Now | ScarsHQ',
  description: 'Scars of Honor is free on Steam and the playtest is live until May 11, 2026. No key needed. Step by step guide to get in game in under 2 minutes.',
  openGraph: {
    title: 'How to Download and Play Scars of Honor',
    description: 'Free to play MMORPG on Steam. Request playtest access on the Steam page. Step by step guide to get in game.',
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
    title: 'How to Download Scars of Honor',
    description: 'Free on Steam. Request playtest access on the Steam page. Next playtest: April 30 to May 11, 2026.',
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
