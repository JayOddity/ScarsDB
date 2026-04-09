import type { Metadata } from 'next';
import DownloadContent from './DownloadContent';

export const metadata: Metadata = {
  title: 'How to Download Scars of Honor | Free on Steam | ScarsHQ',
  description: 'Scars of Honor is free to play on Steam. Request playtest access on the Steam page. Next playtest: April 30 to May 11, 2026.',
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

export default function DownloadPage() {
  return <DownloadContent />;
}
