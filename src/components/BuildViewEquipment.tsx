'use client';

import { useState, useEffect } from 'react';
import GearPlanner, { type EquippedItems } from './GearPlanner';

interface Props {
  equipmentJson: string;
}

export default function BuildViewEquipment({ equipmentJson }: Props) {
  const [equipped, setEquipped] = useState<EquippedItems>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const map: Record<string, string> = JSON.parse(equipmentJson);
        const entries = Object.entries(map);
        if (entries.length === 0) { setLoading(false); return; }

        const results = await Promise.all(
          entries.map(async ([slot, itemId]) => {
            try {
              const res = await fetch(`/api/items/${encodeURIComponent(itemId)}`);
              if (res.ok) {
                const item = await res.json();
                return [slot, item] as const;
              }
            } catch { /* skip */ }
            return null;
          })
        );

        const eq: EquippedItems = {};
        for (const r of results) {
          if (r) eq[r[0]] = r[1];
        }
        setEquipped(eq);
      } catch { /* invalid JSON */ }
      setLoading(false);
    }
    load();
  }, [equipmentJson]);

  if (loading) {
    return (
      <div className="bg-card-bg border border-border-subtle rounded-lg p-5 animate-pulse">
        <div className="h-6 bg-dark-surface rounded w-24 mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-16 h-16 bg-dark-surface rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return <GearPlanner equipped={equipped} onEquippedChange={() => {}} readOnly />;
}
