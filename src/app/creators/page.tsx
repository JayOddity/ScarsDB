import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Creators & Leaderboards - ScarsHQ',
  description: 'Community content creators, guides, and competitive leaderboards for Scars of Honor.',
};

export default function CreatorsPage() {
  return (
    <ComingSoon
      title="Creators & Leaderboards"
      description="Will feature community content creators, guides, and competitive leaderboards. Discover top streamers, guide writers, and track PvP and PvE rankings."
    />
  );
}
