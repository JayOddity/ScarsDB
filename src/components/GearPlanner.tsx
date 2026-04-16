'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Item } from '@/lib/api';
import { rarityColorClass, rarityBorderClass } from '@/lib/rarityStyles';

const EQUIPMENT_ROWS = [
  [
    { key: 'Helmet', label: 'Helmet', icon: '/Icons/Slots/helmet.avif' },
    { key: 'Shoulder Pads', label: 'Shoulders', icon: '/Icons/Slots/shoulder-pads.avif' },
    { key: 'Cape', label: 'Cape', icon: '/Icons/Slots/cape.avif' },
  ],
  [
    { key: 'Chest Piece', label: 'Chest', icon: '/Icons/Slots/chest-piece.avif' },
    { key: 'Main Hand', label: 'Main Hand', icon: '/Icons/Slots/main-hand.avif' },
    { key: 'Off Hand', label: 'Off Hand', icon: '/Icons/Slots/off-hand.avif' },
  ],
  [
    { key: 'Gloves', label: 'Gloves', icon: '/Icons/Slots/gloves.avif' },
    { key: 'Belt', label: 'Belt', icon: '/Icons/Slots/belt.avif' },
    { key: 'Pants', label: 'Pants', icon: '/Icons/Slots/pants.avif' },
  ],
  [
    { key: 'Boots', label: 'Boots', icon: '/Icons/Slots/boots.avif' },
    { key: 'Amulet', label: 'Amulet', icon: '/Icons/Slots/amulet.avif' },
    { key: 'Ring', label: 'Ring', icon: '/Icons/Slots/ring.avif' },
  ],
];

const ALL_SLOTS = EQUIPMENT_ROWS.flat();

const GATHERING_TOOLS = [
  { label: 'Mining', icon: '/Icons/Slots/mining.avif' },
  { label: 'Herbalism', icon: '/Icons/Slots/herbalism.avif' },
  { label: 'Cooking', icon: '/Icons/Slots/cooking.avif' },
  { label: 'Woodcutting', icon: '/Icons/Slots/woodcutting.avif' },
  { label: 'Fishing', icon: '/Icons/Slots/fishing.avif' },
];
const POTIONS = [
  { label: 'Potion 1', icon: '/Icons/Slots/potion.avif' },
  { label: 'Potion 2', icon: '/Icons/Slots/potion.avif' },
  { label: 'Potion 3', icon: '/Icons/Slots/potion.avif' },
];

const rarityBg: Record<string, string> = {
  Common: 'rgba(157,157,157,0.1)',
  Rare: 'rgba(74,143,247,0.1)',
  Epic: 'rgba(168,85,247,0.1)',
  Legendary: 'rgba(245,158,11,0.1)',
};

export interface EquippedItems {
  [slotKey: string]: Item | null;
}

interface GearPlannerProps {
  equipped?: EquippedItems;
  onEquippedChange?: (equipped: EquippedItems) => void;
  readOnly?: boolean;
}

export default function GearPlanner({ equipped: controlledEquipped, onEquippedChange, readOnly = false }: GearPlannerProps = {}) {
  const [internalEquipped, setInternalEquipped] = useState<EquippedItems>({});
  const isControlled = controlledEquipped !== undefined && onEquippedChange !== undefined;
  const equipped = isControlled ? controlledEquipped : internalEquipped;

  function setEquipped(updater: EquippedItems | ((prev: EquippedItems) => EquippedItems)) {
    if (isControlled) {
      const newVal = typeof updater === 'function' ? updater(controlledEquipped) : updater;
      onEquippedChange(newVal);
    } else {
      setInternalEquipped(updater);
    }
  }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Gear Planner</h1>
      <p className="text-text-secondary mb-8">
        Equip items to each slot and see your total stats. Click a slot to browse available items.
      </p>

      <div className="flex gap-6">
        {/* Paper Doll */}
        <div className="flex-shrink-0 w-[380px]">
          <div className="bg-[#0a0a0f] border border-border-subtle rounded-lg p-6">
            {/* Section Header: Equipped Items */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-honor-gold/40" />
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <span className="font-heading text-xs text-honor-gold tracking-widest uppercase">Equipped Items</span>
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <div className="flex-1 h-px bg-honor-gold/40" />
            </div>

            {/* Equipment Grid */}
            <div className="space-y-4 mb-8">
              {EQUIPMENT_ROWS.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-4">
                  {row.map((slot) => {
                    const item = equipped[slot.key];
                    return (
                      <div key={slot.key} className="flex flex-col items-center">
                        <button
                          onClick={() => { if (readOnly) return; item ? unequipSlot(slot.key) : setSelectorSlot(slot.key); }}
                          onContextMenu={(e) => { e.preventDefault(); if (!readOnly) unequipSlot(slot.key); }}
                          className={`w-[72px] h-[72px] rounded-md border-2 flex items-center justify-center transition-all relative group ${
                            readOnly ? '' : 'hover:scale-105'
                          } ${
                            item
                              ? `${rarityBorderClass[item.rarity]} ${readOnly ? '' : 'hover:opacity-80'}`
                              : `border-[#2a2a35] bg-[#12121a] ${readOnly ? '' : 'hover:border-honor-gold-dim'}`
                          }`}
                          style={item ? { backgroundColor: rarityBg[item.rarity] } : undefined}
                          title={item ? item.name : slot.label}
                        >
                          {item ? (
                            item.icon && !item.icon.includes('placehold') ? (
                              <Image src={item.icon} alt={item.name} width={56} height={56} className="object-cover rounded" />
                            ) : (
                              <span className={`text-xs font-bold ${rarityColorClass[item.rarity]}`}>{item.name.substring(0, 3)}</span>
                            )
                          ) : (
                            <Image src={slot.icon} alt={slot.label} width={48} height={48} className="object-contain opacity-30" />
                          )}
                          {item && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 bg-scar-red rounded-full flex items-center justify-center transition-opacity ${readOnly ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                              <span className="text-[8px] text-white font-bold">x</span>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Section Header: Gathering Tools */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-honor-gold/40" />
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <span className="font-heading text-xs text-honor-gold tracking-widest uppercase">Gathering Tools</span>
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <div className="flex-1 h-px bg-honor-gold/40" />
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {GATHERING_TOOLS.map((tool) => (
                <div
                  key={tool.label}
                  className="w-12 h-12 rounded border-2 border-[#2a2a35] bg-[#12121a] flex items-center justify-center"
                  title={tool.label}
                >
                  <Image src={tool.icon} alt={tool.label} width={36} height={36} className="object-contain opacity-30" />
                </div>
              ))}
            </div>

            {/* Section Header: Potions */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-honor-gold/40" />
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <span className="font-heading text-xs text-honor-gold tracking-widest uppercase">Potions</span>
              <div className="w-2 h-2 bg-honor-gold rotate-45" />
              <div className="flex-1 h-px bg-honor-gold/40" />
            </div>

            <div className="flex justify-center gap-5 mb-2">
              {POTIONS.map((pot) => (
                <div
                  key={pot.label}
                  className="w-14 h-14 rotate-45 rounded-sm border-2 border-[#2a2a35] bg-[#12121a] flex items-center justify-center"
                  title={pot.label}
                >
                  <Image src={pot.icon} alt={pot.label} width={32} height={32} className="-rotate-45 object-contain opacity-30" />
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-text-muted">{equippedCount}/{ALL_SLOTS.length} equipped</span>
            </div>
          </div>
        </div>

        {/* Stats + Item Selector */}
        <div className="flex-1 min-w-0">
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
                {ALL_SLOTS.map((slot) => {
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

        {/* Item Selector (hidden in read-only) */}
        {!readOnly && <div className="flex-1 min-w-0">
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
                            <Image src={item.icon} alt="" width={32} height={32} className="object-cover" />
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
        </div>}
      </div>
    </div>
  );
}
