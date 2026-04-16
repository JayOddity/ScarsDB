'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { rarityColorClass, rarityBorderClass } from '@/lib/rarityStyles';

interface PopularItem {
  id: string;
  name: string;
  rarity: string;
  icon?: string;
  type?: string;
  slot_type?: string;
  count: number;
}

export default function PopularItems() {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/views')
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setItems(data.items.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl text-honor-gold">Popular Items</h2>
        <Link href="/items" className="text-honor-gold hover:text-honor-gold-light text-sm font-medium transition-colors">
          All Items →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[106px] bg-card-bg border border-border-subtle rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className={`flex flex-col items-center gap-2 p-3 bg-card-bg border rounded-lg hover:border-honor-gold-dim transition-colors glow-gold-hover group ${rarityBorderClass[item.rarity] || 'border-border-subtle'}`}
            >
              <div className="w-10 h-10 rounded bg-dark-surface overflow-hidden flex items-center justify-center flex-shrink-0">
                {item.icon && !item.icon.includes('placehold') ? (
                  <Image src={item.icon} alt="" width={40} height={40} className="object-cover" />
                ) : (
                  <span className="text-sm text-text-muted">?</span>
                )}
              </div>
              <span className={`text-xs text-center truncate w-full group-hover:text-honor-gold transition-colors ${rarityColorClass[item.rarity] || 'text-text-secondary'}`}>
                {item.name}
              </span>
              {item.slot_type && (
                <span className="text-[10px] text-text-muted">{item.slot_type}</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
          <p className="text-sm text-text-muted">Browse some items to see trending picks here.</p>
        </div>
      )}
    </div>
  );
}
