import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Scars of Honor NPCs & Bestiary | ScarsHQ',
  description: 'A database of creatures, bosses, and NPCs found across Aragon in Scars of Honor.',
};

export default function NpcsPage() {
  return (
    <ComingSoon
      title="Scars of Honor NPCs & Bestiary"
      description="Will contain a database of creatures, bosses, and NPCs found across Aragon. Discover loot tables, spawn locations, and strategies for every encounter."
    />
  );
}
