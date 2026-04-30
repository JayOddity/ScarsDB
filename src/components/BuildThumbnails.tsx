'use client';

import { useState, useEffect } from 'react';
import type { RealTalentData, RealTalentNode } from '@/lib/talentData';
import { getStartNodes } from '@/lib/buildThumbnails';

const talentCache = new Map<string, RealTalentData>();

interface BuildThumbnailsProps {
  classSlug: string;
  allocation: string;
  size?: number;
}

export default function BuildThumbnails({ classSlug, allocation, size = 36 }: BuildThumbnailsProps) {
  const [starts, setStarts] = useState<RealTalentNode[]>([]);

  useEffect(() => {
    if (!classSlug || !allocation) { setStarts([]); return; }
    const cached = talentCache.get(classSlug);
    if (cached) {
      setStarts(getStartNodes(allocation, cached.nodes));
      return;
    }
    fetch(`/data/talents/${classSlug}.json`)
      .then((r) => r.json())
      .then((data: RealTalentData) => {
        talentCache.set(classSlug, data);
        setStarts(getStartNodes(allocation, data.nodes));
      })
      .catch(() => {});
  }, [classSlug, allocation]);

  if (starts.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {starts.map((node) => (
        <div
          key={node.id}
          className="relative shrink-0"
          style={{ width: size, height: size }}
          title={node.name.replace(/<[^>]+>/g, '')}
        >
          {node.iconUrl && (
            <img
              src={node.iconUrl}
              alt=""
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
              style={{ width: '55%', height: '55%' }}
            />
          )}
          <img
            src="/Icons/Talents/frames/start.png"
            alt={node.name.replace(/<[^>]+>/g, '')}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        </div>
      ))}
    </div>
  );
}
