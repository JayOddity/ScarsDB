'use client';

import { useState, useEffect } from 'react';
import type { RealTalentData, RealTalentNode } from '@/lib/talentData';
import { getFeaturedNodes } from '@/lib/buildThumbnails';

const FRAME_ROUND = '/Icons/Talents/scars%20icon%201.avif';
const FRAME_SQUARE = '/Icons/Talents/scars%20icon%202.avif';

// Cache loaded talent data per class
const talentCache = new Map<string, RealTalentData>();

interface BuildThumbnailsProps {
  classSlug: string;
  allocation: string;
  size?: number;
}

export default function BuildThumbnails({ classSlug, allocation, size = 36 }: BuildThumbnailsProps) {
  const [nodes, setNodes] = useState<{ early: RealTalentNode[]; late: RealTalentNode[] }>({ early: [], late: [] });

  useEffect(() => {
    if (!classSlug || !allocation) return;

    const cached = talentCache.get(classSlug);
    if (cached) {
      setNodes(getFeaturedNodes(allocation, cached.nodes));
      return;
    }

    fetch(`/data/talents/${classSlug}.json`)
      .then((r) => r.json())
      .then((data: RealTalentData) => {
        talentCache.set(classSlug, data);
        setNodes(getFeaturedNodes(allocation, data.nodes));
      })
      .catch(() => {});
  }, [classSlug, allocation]);

  const all = [...nodes.early, ...nodes.late];
  if (all.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {all.map((node) => {
        const frame = node.nodeType === 'active' ? FRAME_SQUARE : FRAME_ROUND;
        const iconUrl = node.iconUrl;
        return (
          <div
            key={node.id}
            className="relative shrink-0"
            style={{ width: size, height: size }}
            title={node.name}
          >
            {/* Frame */}
            <img
              src={frame}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
            />
            {/* Ability icon overlay */}
            {iconUrl && (
              <img
                src={iconUrl}
                alt={node.name}
                className="absolute inset-[18%] w-[64%] h-[64%] object-cover rounded-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
