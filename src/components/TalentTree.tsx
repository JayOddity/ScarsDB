'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { GameClass } from '@/data/classes';
import { hasRealData, type RealTalentData } from '@/lib/talentData';

// --- Types ---
interface TalentNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: 'start' | 'minor' | 'major' | 'keystone' | 'active';
  name: string;
  description: string;
  maxRank: number;
}
interface TalentEdge { from: number; to: number; }

// Node sizing
const SIZE: Record<string, number> = { start: 44, minor: 27, major: 36, keystone: 47, active: 34 };

// URL encode/decode
function encodeAlloc(a: Record<number, number>): string {
  const e = Object.entries(a).filter(([, v]) => v > 0);
  return e.length ? e.map(([k, v]) => `${k}:${v}`).join(',') : '';
}
function decodeAlloc(s: string): Record<number, number> {
  if (!s) return {};
  const r: Record<number, number> = {};
  s.split(',').forEach((p) => { const [k, v] = p.split(':'); if (k && v) r[Number(k)] = Number(v); });
  return r;
}

export default function TalentTree({ gameClass }: { gameClass: GameClass }) {
  const [nodes, setNodes] = useState<TalentNode[]>([]);
  const [edges, setEdges] = useState<TalentEdge[]>([]);
  const [accentColor, setAccentColor] = useState('#c8a84e');
  const [loading, setLoading] = useState(true);
  const [allocated, setAllocated] = useState<Record<number, number>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedBuildExists, setSavedBuildExists] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // View state — zoom is a single number, position is center
  const [camera, setCamera] = useState({ cx: 0, cy: 0, zoom: 1 });
  const [panning, setPanning] = useState(false);
  const panRef = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });

  // Compute viewBox from camera
  const getViewBox = useCallback(() => {
    const baseW = 4000;
    const baseH = 3000;
    const w = baseW / camera.zoom;
    const h = baseH / camera.zoom;
    return { x: camera.cx - w / 2, y: camera.cy - h / 2, w, h };
  }, [camera]);

  const vb = getViewBox();

  // Load talent data
  useEffect(() => {
    async function load() {
      if (hasRealData(gameClass.slug)) {
        try {
          const res = await fetch(`/data/talents/${gameClass.slug}.json`);
          const data: RealTalentData = await res.json();
          // Push non-start nodes from center; tier 2 (connected to start) gets extra 50px
          const startNds = data.nodes.filter((n: TalentNode) => n.nodeType === 'start');
          const startIds = new Set(startNds.map((n: TalentNode) => n.id));
          const cx0 = startNds.reduce((s: number, n: TalentNode) => s + n.dx, 0) / (startNds.length || 1);
          const cy0 = startNds.reduce((s: number, n: TalentNode) => s + n.dy, 0) / (startNds.length || 1);
          // Find tier 2: nodes directly connected to a start node
          const tier2 = new Set<number>();
          for (const e of data.connections) {
            if (startIds.has(e.from) && !startIds.has(e.to)) tier2.add(e.to);
            if (startIds.has(e.to) && !startIds.has(e.from)) tier2.add(e.from);
          }
          const pushed = data.nodes.map((n: TalentNode) => {
            if (n.nodeType === 'start') return n;
            const dx = n.dx - cx0;
            const dy = n.dy - cy0;
            const dist = Math.hypot(dx, dy);
            if (dist === 0) return n;
            const push = 100;
            return { ...n, dx: n.dx + (dx / dist) * push, dy: n.dy + (dy / dist) * push };
          });
          setNodes(pushed);
          setEdges(data.connections);
          setAccentColor(data.accentColor);

          // Auto-fit camera to data bounds
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (const n of data.nodes) {
            minX = Math.min(minX, n.dx); maxX = Math.max(maxX, n.dx);
            minY = Math.min(minY, n.dy); maxY = Math.max(maxY, n.dy);
          }
          const dataW = maxX - minX;
          const dataH = maxY - minY;
          const fitZoom = Math.min(4000 / (dataW + 400), 3000 / (dataH + 400));
          setCamera({ cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, zoom: fitZoom });
        } catch {
          // empty
        }
      }
      setLoading(false);
    }
    load();
  }, [gameClass]);

  // Load hash allocations
  useEffect(() => {
    if (nodes.length === 0) return;
    const h = window.location.hash.slice(1);
    if (h) setAllocated(decodeAlloc(h));
  }, [nodes]);

  // Save to hash
  useEffect(() => {
    if (nodes.length === 0) return;
    const enc = encodeAlloc(allocated);
    window.history.replaceState(null, '', `${window.location.pathname}${enc ? '#' + enc : ''}`);
  }, [allocated, nodes]);

  // Check if a saved build exists in localStorage
  useEffect(() => {
    try {
      setSavedBuildExists(!!localStorage.getItem(`scarsdb-talent-${gameClass.slug}`));
    } catch {}
  }, [gameClass.slug]);

  // Adjacency
  const adj = useMemo(() => {
    const m: Record<number, number[]> = {};
    for (const n of nodes) m[n.id] = [];
    for (const e of edges) {
      m[e.from]?.push(e.to);
      m[e.to]?.push(e.from);
    }
    return m;
  }, [nodes, edges]);

  const totalPts = useMemo(() => Object.values(allocated).reduce((s, v) => s + v, 0), [allocated]);

  // Check if any start node is already allocated
  const hasStartAlloc = useMemo(() => {
    return nodes.some((n) => n.nodeType === 'start' && (allocated[n.id] || 0) > 0);
  }, [nodes, allocated]);

  const canAlloc = useCallback((node: TalentNode): boolean => {
    if ((allocated[node.id] || 0) >= node.maxRank) return false;
    if (node.nodeType === 'start') {
      // Only one start node can ever be selected
      if (hasStartAlloc && (allocated[node.id] || 0) === 0) return false;
      return true;
    }
    return (adj[node.id] || []).some((nid) => (allocated[nid] || 0) > 0);
  }, [allocated, adj, hasStartAlloc]);

  const canDealloc = useCallback((node: TalentNode): boolean => {
    const cur = allocated[node.id] || 0;
    if (cur <= 0) return false;
    if (cur > 1) return true;
    const neighbors = adj[node.id] || [];
    for (const nid of neighbors) {
      if ((allocated[nid] || 0) > 0) {
        const nn = adj[nid] || [];
        const otherAlloc = nn.filter((x) => x !== node.id && (allocated[x] || 0) > 0);
        const isStart = nodes.find((n) => n.id === nid)?.nodeType === 'start';
        if (otherAlloc.length === 0 && !isStart) return false;
      }
    }
    return true;
  }, [allocated, adj, nodes]);

  function doAlloc(node: TalentNode) {
    if (!canAlloc(node)) return;
    setAllocated((p) => ({ ...p, [node.id]: (p[node.id] || 0) + 1 }));
  }
  function doDealloc(node: TalentNode) {
    if (!canDealloc(node)) return;
    setAllocated((p) => {
      const n = { ...p }; const c = (n[node.id] || 0) - 1;
      if (c <= 0) delete n[node.id]; else n[node.id] = c; return n;
    });
  }
  function reset() { setAllocated({}); }
  function resetView() {
    if (nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) { minX = Math.min(minX, n.dx); maxX = Math.max(maxX, n.dx); minY = Math.min(minY, n.dy); maxY = Math.max(maxY, n.dy); }
    const fitZoom = Math.min(4000 / (maxX - minX + 400), 3000 / (maxY - minY + 400));
    setCamera({ cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, zoom: fitZoom });
  }

  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  function saveBuild() {
    try {
      const key = `scarsdb-talent-${gameClass.slug}`;
      localStorage.setItem(key, encodeAlloc(allocated));
      setSavedBuildExists(true);
    } catch {}
  }

  function loadBuild() {
    try {
      const key = `scarsdb-talent-${gameClass.slug}`;
      const saved = localStorage.getItem(key);
      if (saved) setAllocated(decodeAlloc(saved));
    } catch {}
  }

  // BFS: find shortest path from any allocated node (or start node if none allocated) to target
  // Returns array of node IDs to allocate (includes start node if needed, includes target)
  const findShortestPath = useCallback((targetId: number): number[] => {
    if ((allocated[targetId] || 0) > 0) return [];

    const allocatedIds = new Set(
      Object.keys(allocated).filter((k) => allocated[Number(k)] > 0).map(Number)
    );

    // Sources: allocated nodes, or if nothing allocated yet, all start nodes
    const sourceSet = allocatedIds.size > 0
      ? allocatedIds
      : new Set(nodes.filter((n) => n.nodeType === 'start').map((n) => n.id));

    if (sourceSet.size === 0) return [];

    // BFS outward from targetId; stop when we hit a source
    const visited = new Set<number>([targetId]);
    const parent = new Map<number, number>();
    const queue: number[] = [targetId];

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (sourceSet.has(cur)) {
        // Reconstruct path from source toward targetId
        const path: number[] = [];
        let s = cur;
        // Include the source itself if it's a start node that isn't allocated yet
        if (allocatedIds.size === 0) path.push(cur);
        while (parent.has(s)) {
          s = parent.get(s)!;
          path.push(s);
        }
        return path;
      }
      for (const nb of (adj[cur] || [])) {
        if (!visited.has(nb)) {
          visited.add(nb);
          parent.set(nb, cur);
          queue.push(nb);
        }
      }
    }
    return [];
  }, [allocated, adj, nodes]);

  // Compute hovered path
  const hoveredPath = useMemo(() => {
    if (hoveredId === null) return new Set<number>();
    if ((allocated[hoveredId] || 0) > 0) return new Set<number>();
    return new Set(findShortestPath(hoveredId));
  }, [hoveredId, findShortestPath, allocated]);

  // Click handler: auto-allocate entire path
  function doAllocPath(node: TalentNode) {
    if ((allocated[node.id] || 0) > 0) {
      // Already allocated — just increment rank if possible
      doAlloc(node);
      return;
    }
    const path = findShortestPath(node.id);
    if (path.length === 0) return;
    setAllocated((prev) => {
      const next = { ...prev };
      for (const nid of path) {
        next[nid] = Math.max(next[nid] || 0, 1);
      }
      return next;
    });
  }

  // Zoom — native event listener with { passive: false } so preventDefault stops page scroll
  // Re-attach when loading changes (container isn't in DOM while loading=true)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY > 0 ? 0.85 : 1.18;
      setCamera((c) => {
        const newZoom = Math.max(0.15, Math.min(15, c.zoom * factor));
        const svg = svgRef.current;
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const mx = (e.clientX - rect.left) / rect.width;
          const my = (e.clientY - rect.top) / rect.height;
          const oldW = 4000 / c.zoom;
          const oldH = 3000 / c.zoom;
          const newW = 4000 / newZoom;
          const newH = 3000 / newZoom;
          const worldX = c.cx - oldW / 2 + mx * oldW;
          const worldY = c.cy - oldH / 2 + my * oldH;
          return {
            cx: worldX - (mx - 0.5) * newW,
            cy: worldY - (my - 0.5) * newH,
            zoom: newZoom,
          };
        }
        return { ...c, zoom: newZoom };
      });
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [loading]);

  // Pan
  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    const tag = (e.target as Element).tagName.toLowerCase();
    if (tag === 'svg' || tag === 'rect' || (e.target as Element).classList.contains('bg-rect')) {
      setPanning(true);
      panRef.current = { mx: e.clientX, my: e.clientY, cx: camera.cx, cy: camera.cy };
    }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!panning || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = vb.w / rect.width;
    const sy = vb.h / rect.height;
    setCamera((c) => ({
      ...c,
      cx: panRef.current.cx - (e.clientX - panRef.current.mx) * sx,
      cy: panRef.current.cy - (e.clientY - panRef.current.my) * sy,
    }));
  }
  function onMouseUp() { setPanning(false); }

  function zoomIn() { setCamera((c) => ({ ...c, zoom: Math.min(15, c.zoom * 1.3) })); }
  function zoomOut() { setCamera((c) => ({ ...c, zoom: Math.max(0.15, c.zoom * 0.7) })); }

  const hovered = hoveredId != null ? nodes.find((n) => n.id === hoveredId) : null;
  const col = accentColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-void-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border-subtle rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-honor-gold rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar — compact */}
      <div className="flex-shrink-0 bg-void-black/90 backdrop-blur border-b border-border-subtle px-4 py-2">
        <div className="flex items-center justify-between max-w-[100vw]">
          <div className="flex items-center gap-3">
            <nav className="text-xs text-text-muted hidden sm:flex items-center gap-1.5">
              <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
              <span>/</span>
              <Link href="/talents" className="hover:text-honor-gold transition-colors">Talents</Link>
              <span>/</span>
            </nav>
            <span className="text-2xl">{gameClass.icon}</span>
            <div>
              <h1 className="font-heading text-lg" style={{ color: col }}>{gameClass.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">
                  Points: <span className="font-bold" style={{ color: col }}>{totalPts}</span>
                </span>
                <span className="text-[10px] text-text-muted">{nodes.length} nodes</span>
              </div>
            </div>
          </div>

          {/* Build summary inline */}
          {totalPts > 0 && (
            <div className="hidden md:flex items-center gap-1.5 flex-1 mx-6 overflow-x-auto">
              {nodes.filter((n) => (allocated[n.id] || 0) > 0).slice(0, 12).map((node) => (
                <span key={node.id} className="text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0"
                  style={{ borderColor: col + '50', backgroundColor: col + '10', color: col }}>
                  {node.name} {allocated[node.id]}/{node.maxRank}
                </span>
              ))}
              {nodes.filter((n) => (allocated[n.id] || 0) > 0).length > 12 && (
                <span className="text-[9px] text-text-muted">+{nodes.filter((n) => (allocated[n.id] || 0) > 0).length - 12} more</span>
              )}
            </div>
          )}

          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={saveBuild} className="px-2.5 py-1 bg-dark-surface border border-border-subtle rounded text-[11px] text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors">Save</button>
            <button onClick={loadBuild} className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${savedBuildExists ? 'bg-honor-gold/15 border-honor-gold-dim text-honor-gold hover:bg-honor-gold/25' : 'bg-dark-surface border-border-subtle text-text-muted cursor-not-allowed opacity-50'}`} disabled={!savedBuildExists}>Load</button>
            <button onClick={resetView} className="px-2.5 py-1 bg-dark-surface border border-border-subtle rounded text-[11px] text-text-muted hover:text-text-secondary transition-colors">Fit</button>
            <button onClick={share} className="px-2.5 py-1 bg-honor-gold/10 border border-honor-gold-dim rounded text-[11px] text-honor-gold hover:bg-honor-gold/20 transition-colors">
              {copied ? '✓' : '🔗'}
            </button>
            <button onClick={reset} className="px-2.5 py-1 bg-dark-surface border border-border-subtle rounded text-[11px] text-text-secondary hover:text-scar-red-light hover:border-scar-red/50 transition-colors">Reset</button>
          </div>
        </div>
      </div>

      {/* Full-page SVG canvas */}
      <div ref={containerRef} className="flex-1 relative bg-[#000000] overflow-hidden">
        <svg ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          className="w-full h-full select-none" style={{ cursor: panning ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

          <rect className="bg-rect" x={vb.x - 5000} y={vb.y - 5000} width={vb.w + 10000} height={vb.h + 10000} fill="#000000" />

          {/* Defs for radial gradients */}
          <defs>
            <radialGradient id="node-grad-alloc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={col} stopOpacity={0.35} />
              <stop offset="60%" stopColor={col} stopOpacity={0.15} />
              <stop offset="100%" stopColor={col} stopOpacity={0.05} />
            </radialGradient>
            <radialGradient id="node-grad-maxed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={col} stopOpacity={0.5} />
              <stop offset="50%" stopColor={col} stopOpacity={0.25} />
              <stop offset="100%" stopColor={col} stopOpacity={0.08} />
            </radialGradient>
            <radialGradient id="node-grad-path" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#44ee66" stopOpacity={0.3} />
              <stop offset="60%" stopColor="#44ee66" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#44ee66" stopOpacity={0.02} />
            </radialGradient>
            <radialGradient id="node-grad-unalloc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#222233" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#0a0a12" stopOpacity={0.9} />
            </radialGradient>
          </defs>

          {/* Grid rings */}
          {[300, 700, 1200, 1800, 2500].map((r) => (
            <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="#1a1a30" strokeWidth={0.5} />
          ))}

          {/* Edges */}
          {edges.map((e) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            const aA = (allocated[a.id] || 0) > 0;
            const bA = (allocated[b.id] || 0) > 0;
            const both = aA && bA;
            const one = aA || bA;
            // Highlight edge if both endpoints are on the hovered path (or one is allocated and other on path)
            const aOnPath = hoveredPath.has(a.id) || aA;
            const bOnPath = hoveredPath.has(b.id) || bA;
            const edgeOnPath = hoveredPath.size > 0 && (hoveredPath.has(a.id) || hoveredPath.has(b.id)) && aOnPath && bOnPath;
            return (
              <line key={`${e.from}-${e.to}`}
                x1={a.dx} y1={a.dy} x2={b.dx} y2={b.dy}
                stroke={edgeOnPath ? '#44ee66' : both ? col : one ? col : '#b3b3b3'}
                strokeWidth={edgeOnPath ? 2 : both ? 2.5 : one ? 1.5 : 0.8}
                opacity={edgeOnPath ? 0.7 : both ? 0.9 : one ? 0.5 : 1}
                strokeDasharray={both || edgeOnPath ? undefined : one ? '6 4' : undefined}
              />
            );
          })}

          {/* Red starting circle touching start nodes */}
          {(() => {
            const startNodes = nodes.filter((n) => n.nodeType === 'start');
            if (startNodes.length === 0) return null;
            const avgX = startNodes.reduce((s, n) => s + n.dx, 0) / startNodes.length;
            const avgY = startNodes.reduce((s, n) => s + n.dy, 0) / startNodes.length;
            // Radius passes through the center of the start nodes
            const maxDist = Math.max(...startNodes.map((n) => Math.hypot(n.dx - avgX, n.dy - avgY)));
            const circleR = maxDist;
            return (
              <>
                <circle cx={avgX} cy={avgY} r={circleR} fill="none" stroke="#cc2233" strokeWidth={1.5} opacity={0.5} />
                <circle cx={avgX} cy={avgY} r={circleR + 4} fill="none" stroke="#cc2233" strokeWidth={0.5} opacity={0.25} />
              </>
            );
          })()}

          {/* Nodes */}
          {nodes.map((node) => {
            const cur = allocated[node.id] || 0;
            const avail = canAlloc(node);
            const isAlloc = cur > 0;
            const isMaxed = cur >= node.maxRank;
            const isHov = hoveredId === node.id;
            const isOnPath = hoveredPath.has(node.id);
            const r = SIZE[node.nodeType] || 12;

            // Colors based on state
            const pathGreen = '#44ee66';
            const isStartHighlight = node.nodeType === 'start' && !isAlloc && !hasStartAlloc;
            const ringOpacity = isOnPath ? 0.4 : isStartHighlight ? 0.4 : isAlloc || isMaxed ? 0.35 : 0.2;

            // Circle with 4 small notches at cardinal directions (top, right, bottom, left)
            const notchedCirclePath = (cx: number, cy: number, rad: number) => {
              const outerR = rad;
              const notchW = rad * 0.2;
              const notchD = rad * 0.18;
              const innerR = outerR - notchD;
              const notchCenters = [
                -Math.PI / 2, 0, Math.PI / 2, Math.PI,
              ];
              const notchHalfAngle = Math.asin(Math.min(notchW / outerR, 0.95));
              let d = '';
              for (let i = 0; i < 4; i++) {
                const na = notchCenters[i];
                const nextNa = notchCenters[(i + 1) % 4];
                const arcStart = na + notchHalfAngle;
                const arcEnd = nextNa - notchHalfAngle;
                const sx = cx + outerR * Math.cos(arcStart);
                const sy = cy + outerR * Math.sin(arcStart);
                if (i === 0) d += `M ${sx} ${sy} `;
                else d += `L ${sx} ${sy} `;
                const ex = cx + outerR * Math.cos(arcEnd);
                const ey = cy + outerR * Math.sin(arcEnd);
                d += `A ${outerR} ${outerR} 0 0 1 ${ex} ${ey} `;
                const n1x = cx + innerR * Math.cos(arcEnd);
                const n1y = cy + innerR * Math.sin(arcEnd);
                const n2Angle = nextNa + notchHalfAngle;
                const n2x = cx + innerR * Math.cos(n2Angle);
                const n2y = cy + innerR * Math.sin(n2Angle);
                d += `L ${n1x} ${n1y} `;
                d += `A ${innerR * 0.4} ${innerR * 0.4} 0 0 0 ${n2x} ${n2y} `;
              }
              d += 'Z';
              return d;
            };

            // Corner accent lines for active (square) nodes
            const cornerAccents = (cx: number, cy: number, s: number) => {
              const o = s + 3; // offset from center
              const len = s * 0.4; // length of each accent line
              return [
                // Top-left corner
                `M ${cx - o} ${cy - o + len} L ${cx - o} ${cy - o} L ${cx - o + len} ${cy - o}`,
                // Top-right corner
                `M ${cx + o - len} ${cy - o} L ${cx + o} ${cy - o} L ${cx + o} ${cy - o + len}`,
                // Bottom-right corner
                `M ${cx + o} ${cy + o - len} L ${cx + o} ${cy + o} L ${cx + o - len} ${cy + o}`,
                // Bottom-left corner
                `M ${cx - o + len} ${cy + o} L ${cx - o} ${cy + o} L ${cx - o} ${cy + o - len}`,
              ].join(' ');
            };

            return (
              <g key={node.id}
                className="cursor-pointer"
                onClick={() => doAllocPath(node)}
                onContextMenu={(ev) => { ev.preventDefault(); doDealloc(node); }}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Glow for path / start / allocated / hover */}
                {(isOnPath || isStartHighlight) && (
                  <circle cx={node.dx} cy={node.dy} r={r + 8} fill={pathGreen} opacity={0.07} />
                )}
                {isAlloc && !isOnPath && (
                  <circle cx={node.dx} cy={node.dy} r={r + 8} fill={col} opacity={0.06} />
                )}
                {isMaxed && (
                  <circle cx={node.dx} cy={node.dy} r={r + 10} fill="none" stroke={col} strokeWidth={1.5} opacity={0.15}>
                    <animate attributeName="r" values={`${r + 8};${r + 14};${r + 8}`} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.05;0.2;0.05" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {isHov && !isMaxed && !isOnPath && (
                  <circle cx={node.dx} cy={node.dy} r={r + 6} fill="none" stroke={isAlloc ? col : '#aaa'} strokeWidth={1} opacity={0.3} />
                )}

                {/* Concentric rings (bullseye effect) */}
                <circle cx={node.dx} cy={node.dy} r={r + 4}
                  fill="none"
                  stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#555566'}
                  strokeWidth={0.6}
                  opacity={ringOpacity * 0.8}
                />
                <circle cx={node.dx} cy={node.dy} r={r + 8}
                  fill="none"
                  stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#444455'}
                  strokeWidth={0.4}
                  opacity={ringOpacity * 0.5}
                />

                {/* Outer shape */}
                {node.nodeType === 'active' ? (
                  <>
                    <rect
                      x={node.dx - r * 0.85} y={node.dy - r * 0.85}
                      width={r * 1.7} height={r * 1.7}
                      rx={r * 0.1} ry={r * 0.1}
                      fill={isMaxed ? 'url(#node-grad-maxed)' : isOnPath ? 'url(#node-grad-path)' : isStartHighlight ? 'url(#node-grad-path)' : isAlloc ? 'url(#node-grad-alloc)' : 'url(#node-grad-unalloc)'}
                      stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'}
                      strokeWidth={isAlloc || isOnPath ? 2 : 1.5}
                      opacity={isAlloc || isOnPath || isStartHighlight ? 1 : 0.9}
                    />
                    <path
                      d={cornerAccents(node.dx, node.dy, r * 0.85)}
                      fill="none"
                      stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'}
                      strokeWidth={1}
                      opacity={isAlloc || isOnPath ? 0.7 : 0.4}
                      strokeLinecap="square"
                    />
                  </>
                ) : (
                  <path
                    d={notchedCirclePath(node.dx, node.dy, r)}
                    fill={isMaxed ? 'url(#node-grad-maxed)' : isOnPath ? 'url(#node-grad-path)' : isStartHighlight ? 'url(#node-grad-path)' : isAlloc ? 'url(#node-grad-alloc)' : 'url(#node-grad-unalloc)'}
                    stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'}
                    strokeWidth={isAlloc || isOnPath ? 2 : 1.5}
                    opacity={isAlloc || isOnPath || isStartHighlight ? 1 : 0.9}
                  />
                )}

                {/* Inner circle */}
                <circle cx={node.dx} cy={node.dy} r={r * 0.48}
                  fill={isOnPath ? pathGreen + '10' : isStartHighlight ? pathGreen + '08' : isAlloc ? col + '15' : '#0a0a0a'}
                  stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'}
                  strokeWidth={1}
                  opacity={0.9}
                />

                {/* Hollow plus — dark fill with light outline, like in-game */}
                <line x1={node.dx - r * 0.3} y1={node.dy} x2={node.dx + r * 0.3} y2={node.dy}
                  stroke="#000000" strokeWidth={isAlloc || isOnPath ? 5 : 4} strokeLinecap="round" opacity={0.9} />
                <line x1={node.dx} y1={node.dy - r * 0.3} x2={node.dx} y2={node.dy + r * 0.3}
                  stroke="#000000" strokeWidth={isAlloc || isOnPath ? 5 : 4} strokeLinecap="round" opacity={0.9} />
                <line x1={node.dx - r * 0.3} y1={node.dy} x2={node.dx + r * 0.3} y2={node.dy}
                  stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'} strokeWidth={isAlloc || isOnPath ? 2 : 1.5} strokeLinecap="round" opacity={0.9} />
                <line x1={node.dx} y1={node.dy - r * 0.3} x2={node.dx} y2={node.dy + r * 0.3}
                  stroke={isOnPath ? pathGreen : isStartHighlight ? pathGreen : isAlloc ? col : '#d9d9d9'} strokeWidth={isAlloc || isOnPath ? 2 : 1.5} strokeLinecap="round" opacity={0.9} />

                {/* Rank for multi-rank */}
                {node.maxRank > 1 && (isAlloc || isHov) && (
                  <text x={node.dx} y={node.dy + r + 12} textAnchor="middle" fontSize={9}
                    fill={isMaxed ? col : '#888'} fontFamily="Inter,sans-serif" pointerEvents="none">
                    {cur}/{node.maxRank}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute bottom-4 left-4 bg-[#12122a]/95 border border-border-subtle rounded-lg p-3 shadow-xl max-w-xs pointer-events-none z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-text-primary">{hovered.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                style={{ backgroundColor: col + '20', color: col }}>
                {hovered.nodeType}
              </span>
            </div>
            {hovered.description && (
              <p className="text-[11px] text-text-muted mb-1.5">{hovered.description}</p>
            )}
            <span className="text-[10px]" style={{ color: col }}>
              Rank {allocated[hovered.id] || 0}/{hovered.maxRank}
            </span>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <button onClick={zoomIn}
            className="w-8 h-8 bg-[#12122a]/90 border border-border-subtle rounded text-text-muted hover:text-honor-gold text-lg flex items-center justify-center">+</button>
          <button onClick={zoomOut}
            className="w-8 h-8 bg-[#12122a]/90 border border-border-subtle rounded text-text-muted hover:text-honor-gold text-lg flex items-center justify-center">−</button>
          <button onClick={resetView}
            className="w-8 h-8 bg-[#12122a]/90 border border-border-subtle rounded text-text-muted hover:text-honor-gold text-[10px] flex items-center justify-center" title="Fit to view">⊡</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-[#12122a]/90 border border-border-subtle rounded-lg p-2 text-[9px] text-text-muted space-y-0.5">
          <div className="flex items-center gap-1.5"><span className="text-text-muted text-[10px]">○</span> Small = Minor (passive)</div>
          <div className="flex items-center gap-1.5"><span className="text-text-muted text-[10px]">○</span> Medium = Major (passive)</div>
          <div className="flex items-center gap-1.5"><span className="text-text-muted text-[10px]">□</span> Square = Active (ability)</div>
          <div className="flex items-center gap-1.5"><span style={{ color: col }} className="text-[10px]">○</span> Large = Start / Keystone</div>
          <div className="flex items-center gap-1.5"><span className="text-text-muted text-[10px]">+</span> Click to allocate</div>
          <div className="mt-1 pt-1 border-t border-border-subtle text-[8px]">Scroll: zoom · Drag: pan · L/R click</div>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute top-3 left-3 text-[10px] text-text-muted bg-[#12122a]/80 px-2 py-1 rounded">
          {Math.round(camera.zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
