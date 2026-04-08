'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TalentNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: string;
  name: string;
  maxRank: number;
}

interface TalentEdge {
  source: number;
  target: number;
}

interface Props {
  classSlug: string;
  allocation: string;
}

const NODE_RADIUS: Record<string, number> = {
  start: 22,
  minor: 16,
  major: 20,
  keystone: 24,
  active: 20,
};

const ALLOCATED_COLOR = '#86d8af';
const UNALLOCATED_COLOR = '#2a2a4a';

export default function BuildViewTalentEmbed({ classSlug, allocation }: Props) {
  const [nodes, setNodes] = useState<TalentNode[]>([]);
  const [edges, setEdges] = useState<TalentEdge[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse allocation
  const allocated: Record<number, number> = {};
  if (allocation) {
    allocation.split(',').forEach((p) => {
      const [k, v] = p.split(':');
      if (k && v) allocated[Number(k)] = Number(v);
    });
  }

  useEffect(() => {
    fetch(`/data/talents/${classSlug}.json`)
      .then((r) => r.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      })
      .catch(() => {});
  }, [classSlug]);

  // Calculate viewBox to fit all nodes
  const viewBox = useCallback(() => {
    if (nodes.length === 0) return '0 0 1000 800';
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.dx);
      maxX = Math.max(maxX, n.dx);
      minY = Math.min(minY, n.dy);
      maxY = Math.max(maxY, n.dy);
    }
    const pad = 80;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  }, [nodes]);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} viewBox={viewBox()} className="w-full h-full" style={{ background: '#0d0d0d' }}>
        {/* Edges */}
        {edges.map((e, i) => {
          const src = nodeMap.get(e.source);
          const tgt = nodeMap.get(e.target);
          if (!src || !tgt) return null;
          const srcAllocated = (allocated[src.id] || 0) > 0;
          const tgtAllocated = (allocated[tgt.id] || 0) > 0;
          const bothAllocated = srcAllocated && tgtAllocated;
          return (
            <line
              key={i}
              x1={src.dx} y1={src.dy}
              x2={tgt.dx} y2={tgt.dy}
              stroke={bothAllocated ? ALLOCATED_COLOR : '#1a1a2e'}
              strokeWidth={bothAllocated ? 3 : 2}
              strokeOpacity={bothAllocated ? 0.6 : 0.3}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const r = NODE_RADIUS[node.nodeType] || 16;
          const isAllocated = (allocated[node.id] || 0) > 0;
          const rank = allocated[node.id] || 0;

          return (
            <g key={node.id}>
              <circle
                cx={node.dx}
                cy={node.dy}
                r={r}
                fill={isAllocated ? ALLOCATED_COLOR : '#1a1a2e'}
                fillOpacity={isAllocated ? 0.25 : 0.5}
                stroke={isAllocated ? ALLOCATED_COLOR : UNALLOCATED_COLOR}
                strokeWidth={isAllocated ? 2.5 : 1.5}
              />
              {isAllocated && (
                <text
                  x={node.dx}
                  y={node.dy + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={ALLOCATED_COLOR}
                  fontFamily="DM Sans, sans-serif"
                  fontWeight="bold"
                >
                  {rank}/{node.maxRank}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
