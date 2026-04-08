import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Cosmetics - ScarsHQ',
  description: 'Browse available cosmetic items and preview tools for Scars of Honor.',
};

export default function CosmeticsPage() {
  return (
    <ComingSoon
      title="Cosmetics"
      description="Will showcase available cosmetic items and preview tools. Browse skins, outfits, weapon effects, and more from the Scars of Honor in game store."
    />
  );
}
