import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Maps & Zones - ScarsHQ',
  description: 'Interactive maps and zone guides for the world of Aragon in Scars of Honor.',
};

export default function MapsPage() {
  return (
    <ComingSoon
      title="Maps & Zones"
      description="Will feature interactive maps and zone guides for the world of Aragon. Explore regions, points of interest, quest hubs, and resource nodes across every zone."
    />
  );
}
