import type { Metadata } from 'next';
import InteractiveMap from '@/components/map/InteractiveMap';

export const metadata: Metadata = {
  title: 'Scars of Honor Interactive Map — Aragon Atlas | ScarsHQ',
  description:
    'Interactive Scars of Honor map. Datamined points of interest across Aragon and the Irongarth Western Reach — quest givers, regions, cities, and more as data unlocks.',
  keywords: [
    'scars of honor map',
    'scars of honor interactive map',
    'scars of honor atlas',
    'scars of honor world map',
    'scars of honor zones',
    'aragon map',
    'irongarth map',
  ],
  openGraph: {
    title: 'Scars of Honor Interactive Map — Aragon Atlas',
    description:
      'Interactive Scars of Honor map. Datamined points of interest across Aragon and the Irongarth Western Reach.',
    url: '/map',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/maps/aragon-world-map.webp',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor interactive world map of Aragon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Interactive Map — Aragon Atlas',
    description:
      'Interactive Scars of Honor map of Aragon — quest givers, regions and more, datamined from the playtest client.',
    images: ['/images/maps/aragon-world-map.webp'],
  },
  alternates: {
    canonical: '/map',
  },
};

export default function MapPage() {
  return <InteractiveMap />;
}
