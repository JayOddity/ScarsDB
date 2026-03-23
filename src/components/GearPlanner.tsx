'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Item } from '@/lib/api';

const EQUIPMENT_SLOTS = [
  { key: 'Head', label: 'Head', icon: '🪖', row: 0, col: 1 },
  { key: 'Shoulder', label: 'Shoulders', icon: '🦺', row: 1, col: 0 },
  { key: 'Neck', label: 'Neck', icon: '📿', row: 1, col: 2 },
  { key: 'Chest', label: 'Chest', icon: '👕', row: 2, col: 1 },
  { key: 'Main Hand', label: 'Main Hand', icon: '⚔️', row: 3, col: 0 },
  { key: 'Off Hand', label: 'Off Hand', icon: '🛡️', row: 3, col: 2 },
  { key: 'Hands', label: 'Gloves', icon: '🧤', row: 4, col: 0 },
  { key: 'Waist', label: 'Belt', icon: '🪢', row: 4, col: 2 },
  { key: 'Legs', label: 'Legs', icon: '👖', row: 5, col: 1 },
  { key: 'Feet', label: 'Boots', icon: '👢', row: 6, col: 0 },
  { key: 'Back', label: 'Back', icon: '🧣', row: 6, col: 2 },
  { key: 'Ring', label: 'Ring', icon: '💍', row: 7, col: 1 },
];

const rarityColorClass: Record<string, string> = {
  Common: 'rarity-common',
  Rare: 'rarity-rare',
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
};
const rarityBorderClass: Record<string, string> = {
  Common: 'border-rarity-common',
  Rare: 'border-rarity-rare',
  Epic: 'border-rarity-epic',
  Legendary: 'border-rarity-legendary',
};
const rarityBg: Record<string, string> = {
  Common: 'rgba(157,157,157,0.1)',
  Rare: 'rgba(74,143,247,0.1)',
  Epic: 'rgba(168,85,247,0.1)',
  Legendary: 'rgba(245,158,11,0.1)',
};

interface EquippedItems {
  [slotKey: string]: Item | null;
}

export default function GearPlanner() {
  const [equipped, setEquipped] = useState<EquippedItems>({});
  const [selectorSlot, setSelectorSlot] = useState<string | null>(null);
  const [slotItems, setSlotItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSlot, setLoadingSlot] = useState(false);

  const fetchSlotItems = useCallback(async (slot: string) => {
    setLoadingSlot(true);
    try {
      const res = await fetch(`/api/items?slot=${encodeURIComponent(slot)}&per_page=200`);
      const data = await res.json();
      setSlotItems(data.items || []);
    } catch {
      setSlotItems([]);
    } finally {
      setLoadingSlot(false);
    }
  }, []);

  useEffect(() => {
    if (selectorSlot) {
      fetchSlotItems(selectorSlot);
      setSearchTerm('');
    }
  }, [selectorSlot, fetchSlotItems]);

  function equipItem(item: Item) {
    if (!selectorSlot) return;
    setEquipped((prev) => ({ ...prev, [selectorSlot]: item }));
    setSelectorSlot(null);
  }

  function unequipSlot(slot: string) {
    setEquipped((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  // Compute total stats
  const totalStats: Record<string, { min: number; max: number }> = {};
  Object.values(equipped).forEach((item) => {
    if (!item?.stat_configuration?.lists) return;
    item.stat_configuration.lists.forEach((list) => {
      list.modifications.forEach((mod) => {
        if (!totalStats[mod.stat]) totalStats[mod.stat] = { min: 0, max: 0 };
        totalStats[mod.stat].min += parseFloat(mod.modif_min_value);
        totalStats[mod.stat].max += parseFloat(mod.modif_max_value);
      });
    });
  });

  const equippedCount = Object.values(equipped).filter(Boolean).length;

  const filteredSlotItems = slotItems.filter((i) =>
    !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Gear Planner</h1>
      <p className="text-text-secondary mb-8">
        Equip items to each slot and see your total stats. Click a slot to browse available items.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Paper Doll */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h2 className="font-heading text-lg text-honor-gold mb-4 text-center">Equipment</h2>
            <div className="grid grid-cols-3 gap-3">
              {EQUIPMENT_SLOTS.map((slot) => {
                const item = equipped[slot.key];
                return (
                  <div
                    key={slot.key}
                    className="flex flex-col items-center"
                    style={{ gridRow: slot.row + 1, gridColumn: slot.col + 1 }}
                  >
                    <button
                      onClick={() => item ? unequipSlot(slot.key) : setSelectorSlot(slot.key)}
                      onContextMenu={(e) => { e.preventDefault(); unequipSlot(slot.key); }}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-105 relative group ${
                        item
                          ? `${rarityBorderClass[item.rarity]} hover:opacity-80`
                          : 'border-border-subtle bg-dark-surface hover:border-honor-gold-dim'
                      }`}
                      style={item ? { backgroundColor: rarityBg[item.rarity] } : undefined}
                      title={item ? `${item.name} (click to unequip)` : `Equip ${slot.label}`}
                    >
                      {item ? (
                        item.icon && !item.icon.includes('placehold') ? (
                          <img src={item.icon} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <span className={`text-xs font-bold ${rarityColorClass[item.rarity]}`}>{item.name.substring(0, 3)}</span>
                        )
                      ) : (
                        <span className="text-xl opacity-40">{slot.icon}</span>
                      )}
                      {item && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-scar-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-white font-bold">×</span>
                        </div>
                      )}
                    </button>
                    <span className="text-[10px] text-text-muted mt-1">{slot.label}</span>
                    {item && (
                      <span className={`text-[9px] font-medium truncate max-w-16 ${rarityColorClass[item.rarity]}`}>
                        {item.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs text-text-muted">{equippedCount} / {EQUIPMENT_SLOTS.length} slots filled</span>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h2 className="font-heading text-lg text-honor-gold mb-4">Total Stats</h2>
            {Object.keys(totalStats).length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">Equip items to see combined stats.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(totalStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([stat, val]) => (
                    <div key={stat} className="flex items-center justify-between py-2 px-3 bg-dark-surface/50 rounded">
                      <span className="text-sm text-text-primary">{stat}</span>
                      <span className="text-sm text-honor-gold font-medium">
                        {val.min === val.max ? `+${val.min}` : `+${val.min} – ${val.max}`}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Equipped list */}
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mt-4">
            <h2 className="font-heading text-lg text-honor-gold mb-4">Equipped Items</h2>
            {equippedCount === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No items equipped yet.</p>
            ) : (
              <div className="space-y-2">
                {EQUIPMENT_SLOTS.map((slot) => {
                  const item = equipped[slot.key];
                  if (!item) return null;
                  return (
                    <div key={slot.key} className="flex items-center gap-2 py-1.5 px-3 bg-dark-surface/50 rounded">
                      <span className="text-xs text-text-muted w-16">{slot.label}</span>
                      <span className={`text-xs font-medium flex-1 truncate ${rarityColorClass[item.rarity]}`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Item Selector */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h2 className="font-heading text-lg text-honor-gold mb-4">
              {selectorSlot ? `Select ${selectorSlot} Item` : 'Item Browser'}
            </h2>

            {!selectorSlot ? (
              <p className="text-sm text-text-muted text-center py-8">
                Click an equipment slot on the left to browse items for that slot.
              </p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-surface border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim mb-3"
                />
                <button
                  onClick={() => setSelectorSlot(null)}
                  className="text-xs text-text-muted hover:text-scar-red-light mb-3 transition-colors"
                >
                  ✕ Close
                </button>

                {loadingSlot ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 bg-dark-surface rounded animate-pulse" />
                    ))}
                  </div>
                ) : filteredSlotItems.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    No items found for this slot.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                    {filteredSlotItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => equipItem(item)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-dark-surface/80 transition-colors text-left group"
                      >
                        <div className={`w-8 h-8 rounded border ${rarityBorderClass[item.rarity]} overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0`}>
                          {item.icon && !item.icon.includes('placehold') ? (
                            <img src={item.icon} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <span className="text-[8px] text-text-muted">?</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${rarityColorClass[item.rarity]} group-hover:underline`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {item.stat_configuration?.lists?.[0]?.modifications
                              .map((m) => m.stat)
                              .join(', ') || 'No stats'}
                          </p>
                        </div>
                        <span className={`text-[10px] ${rarityColorClass[item.rarity]}`}>{item.rarity}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
