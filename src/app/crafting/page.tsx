import { Metadata } from 'next';
import CookingSimulator from '@/components/CookingSimulator';

export const metadata: Metadata = {
  title: 'Crafting Simulator - ScarsHQ',
  description: 'Practice the crafting mini games from Scars of Honor. Master cooking temperatures, ingredient timing, and more.',
};

export default function CraftingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Crafting Simulator</h1>
      <p className="text-text-secondary mb-12 max-w-3xl">
        Practice the crafting mini games before you risk your materials in game.
        Press <kbd className="px-1.5 py-0.5 bg-card-bg border border-border-subtle rounded text-sm text-honor-gold font-mono">E</kbd> to bump up the temperature.
      </p>

      <CookingSimulator />
    </div>
  );
}
