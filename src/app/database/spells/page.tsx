import SpellDatabase from '@/components/SpellDatabase';

export const metadata = {
  title: 'Spell Database — ScarsHQ',
  description: 'Every spell, ability, and passive in Scars of Honor. Filter by school, resource, and flags.',
  alternates: { canonical: '/database/spells' },
};

export default function SpellsPage() {
  return <SpellDatabase />;
}
