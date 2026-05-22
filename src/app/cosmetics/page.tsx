import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Scars of Honor Cosmetics: Skins & Appearance Items | ScarsHQ',
  description: 'Browse available cosmetic items and preview tools for Scars of Honor.',
};

export default function CosmeticsPage() {
  return (
    <ComingSoon
      title="Scars of Honor Cosmetics"
      description="Will showcase available cosmetic items and preview tools. Browse skins, outfits, weapon effects, and more from the Scars of Honor in game store."
    />
  );
}
