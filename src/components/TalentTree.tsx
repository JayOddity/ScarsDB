'use client';

import type { GameClass } from '@/data/classes';

interface TalentTreeProps {
  gameClass: GameClass;
  readOnly?: boolean;
  initialAllocation?: string;
  buildCode?: string;
  initialTab?: string;
}

export default function TalentTree({ gameClass, readOnly = false }: TalentTreeProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center bg-[#0d0d0d] p-6 ${
        readOnly ? 'h-full min-h-[300px]' : 'h-[calc(100vh-64px)]'
      }`}
    >
      <img src={gameClass.icon} alt={gameClass.name} className="w-16 h-16 mb-4 opacity-70" />
      <h2 className="font-heading text-xl text-honor-gold mb-2">Talent Calculator — Coming Soon</h2>
      <p className="text-text-secondary text-sm max-w-md">
        We&apos;re rebuilding this from scratch. Check back closer to launch.
      </p>
    </div>
  );
}
