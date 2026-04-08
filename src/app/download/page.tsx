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

export const quickFacts = [
  { label: 'Platform', value: 'PC via Steam' },
  { label: 'Price', value: 'Free to Play' },
  { label: 'Status', value: 'Pre release playtest phase' },
  { label: 'Next Access', value: 'April 30 - May 11, 2026' },
];

export const steps = [
  {
    step: 1,
    title: 'Get Steam',
    description: 'Scars of Honor is available through Steam. Install the Steam client first if it is not already on your PC.',
    link: 'https://store.steampowered.com/about/',
    linkText: 'Download Steam',
    external: true,
  },
  {
    step: 2,
    title: 'Request Playtest Access',
    description: 'Go to the Steam page and click "Request Access" to sign up for the playtest. Access is not guaranteed — spots may be limited.',
    link: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
    linkText: 'Steam Store Page',
    external: true,
  },
  {
    step: 3,
    title: 'Join the Community',
    description: 'Connect with other players on Discord for news, groups, and build sharing while you wait.',
    link: '/community',
    linkText: 'Community Hub',
    external: false,
  },
  {
    step: 4,
    title: 'Play During Playtests',
    description: 'The next playtest runs April 30 - May 11, 2026. The game will be downloadable on Steam during this window.',
    link: '/playtest',
    linkText: 'Playtest Info',
    external: false,
  },
];

export default function DownloadPage() {
  return <DownloadContent />;
}
