'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GameClass } from '@/data/classes';
import { classes } from '@/data/classes';
import { saveBuild as saveBuildToStorage, type BuildType } from '@/lib/savedBuilds';
import GearPlanner, { type EquippedItems } from './GearPlanner';
import { checkProfanity } from '@/lib/profanityClient';

const MAX_POINTS = 70;
const MAX_STARTS = 2;
import { hasRealData, type RealTalentData } from '@/lib/talentData';

interface TalentNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: 'start' | 'minor' | 'major' | 'keystone' | 'active';
  name: string;
  description: string;
  maxRank: number;
  iconUrl?: string | null;
}
interface TalentEdge { from: number; to: number; }

const SIZE: Record<string, number> = { start: 44, minor: 27, major: 36, keystone: 47, active: 34 };

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

// Pre-compute notched circle path centered at origin
function buildNotchedPath(rad: number): string {
  const outerR = rad;
  const innerR = outerR - rad * 0.18;
  const notchHalfAngle = Math.asin(Math.min(rad * 0.2 / outerR, 0.95));
  const notchCenters = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  let d = '';
  for (let i = 0; i < 4; i++) {
    const na = notchCenters[i];
    const nextNa = notchCenters[(i + 1) % 4];
    const arcStart = na + notchHalfAngle;
    const arcEnd = nextNa - notchHalfAngle;
    const sx = outerR * Math.cos(arcStart), sy = outerR * Math.sin(arcStart);
    d += i === 0 ? `M ${sx} ${sy} ` : `L ${sx} ${sy} `;
    const ex = outerR * Math.cos(arcEnd), ey = outerR * Math.sin(arcEnd);
    d += `A ${outerR} ${outerR} 0 0 1 ${ex} ${ey} `;
    d += `L ${innerR * Math.cos(arcEnd)} ${innerR * Math.sin(arcEnd)} `;
    const n2a = nextNa + notchHalfAngle;
    d += `A ${innerR * 0.4} ${innerR * 0.4} 0 0 0 ${innerR * Math.cos(n2a)} ${innerR * Math.sin(n2a)} `;
  }
  return d + 'Z';
}

function buildCornerAccents(s: number): string {
  const o = s + 3, len = s * 0.4;
  return [
    `M ${-o} ${-o + len} L ${-o} ${-o} L ${-o + len} ${-o}`,
    `M ${o - len} ${-o} L ${o} ${-o} L ${o} ${-o + len}`,
    `M ${o} ${o - len} L ${o} ${o} L ${o - len} ${o}`,
    `M ${-o + len} ${o} L ${-o} ${o} L ${-o} ${o - len}`,
  ].join(' ');
}

const NOTCHED: Record<string, string> = {};
const CORNERS: Record<string, string> = {};
for (const [type, r] of Object.entries(SIZE)) {
  if (type === 'active') CORNERS[type] = buildCornerAccents(r * 0.85);
  else NOTCHED[type] = buildNotchedPath(r);
}

const PG = '#86d8af';

// Generate sparse starfield positions (deterministic so they don't shift on re-render)
const STARS: { x: number; y: number; r: number; o: number }[] = (() => {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  // Simple seeded PRNG (mulberry32)
  let seed = 42;
  const rand = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const spread = 4000; // spread across a large area
  for (let i = 0; i < 1600; i++) {
    stars.push({
      x: (rand() - 0.5) * spread * 2,
      y: (rand() - 0.5) * spread * 2,
      r: rand() * 2.4 + 0.6,        // radius 0.6–3.0
      o: rand() * 0.5 + 0.15,        // opacity 0.15–0.65
    });
  }
  return stars;
})();
const ROUND_ICON_PLACEHOLDER = '/Icons/Talents/scars%20icon%201.avif';
const SQUARE_ICON_PLACEHOLDER = '/Icons/Talents/scars%20icon%202.avif';


// Test ability icon - swap in a CDN item icon on a few nodes to preview how real icons will look
const TEST_ABILITY_ICON = 'https://bb-game.b-cdn.net/game-items/Rings/Legendary/BraceletOfNature_icon_60059.png';
const TEST_ABILITY_NODE_IDS = new Set([7, 8, 9, 10, 11, 12]); // first ring of non-start nodes

// Find the node ID from a DOM event target by walking up to the <g data-nid> element
function getNodeId(target: Element): number | null {
  let el: Element | null = target;
  while (el && el.tagName !== 'svg') {
    if (el instanceof SVGGElement && el.dataset.nid) return Number(el.dataset.nid);
    el = el.parentElement;
  }
  return null;
}

interface TalentTreeProps {
  gameClass: GameClass;
  readOnly?: boolean;
  initialAllocation?: string;
  buildCode?: string;
  initialTab?: string;
  initialData?: RealTalentData | null;
}

function processTalentData(data: RealTalentData) {
  const startNds = data.nodes.filter((n) => n.nodeType === 'start');
  const cx0 = startNds.reduce((s, n) => s + n.dx, 0) / (startNds.length || 1);
  const cy0 = startNds.reduce((s, n) => s + n.dy, 0) / (startNds.length || 1);
  const nodes = data.nodes.map((n) => {
    if (n.nodeType === 'start') return n;
    const dx = n.dx - cx0, dy = n.dy - cy0, dist = Math.hypot(dx, dy);
    if (dist === 0) return n;
    return { ...n, dx: n.dx + (dx / dist) * 100, dy: n.dy + (dy / dist) * 100 };
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of data.nodes) { minX = Math.min(minX, n.dx); maxX = Math.max(maxX, n.dx); minY = Math.min(minY, n.dy); maxY = Math.max(maxY, n.dy); }
  const bounds = { minX, maxX, minY, maxY };
  const camera = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, zoom: Math.min(4000 / (maxX - minX + 400), 3000 / (maxY - minY + 400)) };
  return { nodes, edges: data.connections, accentColor: data.accentColor, bounds, camera };
}

export default function TalentTree({ gameClass, readOnly = false, initialAllocation, buildCode: buildCodeProp, initialTab, initialData }: TalentTreeProps) {
  const initial = useMemo(() => initialData ? processTalentData(initialData) : null, [initialData]);
  const [nodes, setNodes] = useState<TalentNode[]>(() => initial?.nodes ?? []);
  const [edges, setEdges] = useState<TalentEdge[]>(() => initial?.edges ?? []);
  const [accentColor, setAccentColor] = useState(() => initial?.accentColor ?? '#c8a84e');
  const [loading, setLoading] = useState(!initial);
  const [allocated, setAllocated] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<Record<number, number>[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [savedBuildExists, setSavedBuildExists] = useState(false);
  const [cloudCode, setCloudCode] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [saveDifficulty, setSaveDifficulty] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveGuide, setSaveGuide] = useState('');
  const [showGuideEditor, setShowGuideEditor] = useState(false);
  const [profanityWarning, setProfanityWarning] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [buildEquipment, setBuildEquipment] = useState<EquippedItems>({});
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab && ['Equipment', 'Talents', 'Scars'].includes(initialTab) ? initialTab : 'Talents');
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const [showBuildBrowser, setShowBuildBrowser] = useState<'all' | 'mine' | null>(null);
  const [browserBuilds, setBrowserBuilds] = useState<{ code: string; classSlug: string; name: string; totalPoints: number; createdAt: string; authorName?: string }[]>([]);
  const [browserTotal, setBrowserTotal] = useState(0);
  const [browserPage, setBrowserPage] = useState(1);
  const [browserPages, setBrowserPages] = useState(1);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserClass, setBrowserClass] = useState(gameClass.slug);
  const [browserSort, setBrowserSort] = useState<'newest' | 'popular'>('newest');
  const [showTalentSearch, setShowTalentSearch] = useState(false);
  const [talentSearch, setTalentSearch] = useState('');
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const talentRouter = useRouter();

  // Check ban status (skip in read-only)
  useEffect(() => {
    if (readOnly) return;
    fetch('/api/user-status').then((r) => r.json()).then((data) => {
      if (data.banned) setIsBanned(true);
    }).catch(() => {});
  }, [readOnly]);

  // Auto-open class picker when navigating from /talents hub
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pick') === 'true') {
      setShowClassPicker(true);
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, []);
  const [importCode, setImportCode] = useState('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [saving, setSaving] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number } | null>(initial?.bounds ?? null);

  const [camera, setCamera] = useState(() => initial?.camera ?? { cx: 0, cy: 0, zoom: 1 });
  const [panning, setPanning] = useState(false);
  const panRef = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const panFrameRef = useRef(0);
  const isPanningRef = useRef(false);

  function clampCamera(cx: number, cy: number, zoom: number) {
    const b = boundsRef.current;
    if (!b) return { cx, cy, zoom };
    const pad = 300;
    const vw = 4000 / zoom / 2, vh = 3000 / zoom / 2;
    const cxMin = b.minX - pad - vw, cxMax = b.maxX + pad + vw;
    const cyMin = b.minY - pad - vh, cyMax = b.maxY + pad + vh;
    return {
      cx: Math.max(cxMin + vw, Math.min(cxMax - vw, cx)),
      cy: Math.max(cyMin + vh, Math.min(cyMax - vh, cy)),
      zoom,
    };
  }

  // Smooth zoom
  const zoomTargetRef = useRef<{ cx: number; cy: number; zoom: number } | null>(null);
  const zoomAnimRef = useRef(0);
  const animateZoom = useCallback((target: { cx: number; cy: number; zoom: number }) => {
    zoomTargetRef.current = clampCamera(target.cx, target.cy, target.zoom);
    if (zoomAnimRef.current) return;
    const step = () => {
      const t = zoomTargetRef.current;
      if (!t) { zoomAnimRef.current = 0; return; }
      setCamera((c) => {
        const lerp = 0.35;
        const nCx = c.cx + (t.cx - c.cx) * lerp;
        const nCy = c.cy + (t.cy - c.cy) * lerp;
        const nZ = c.zoom + (t.zoom - c.zoom) * lerp;
        if (Math.abs(nZ - t.zoom) < 0.001) {
          zoomTargetRef.current = null; zoomAnimRef.current = 0;
          return { cx: t.cx, cy: t.cy, zoom: t.zoom };
        }
        zoomAnimRef.current = requestAnimationFrame(step);
        return { cx: nCx, cy: nCy, zoom: nZ };
      });
    };
    zoomAnimRef.current = requestAnimationFrame(step);
  }, []);

  const vbW = 4000 / camera.zoom;
  const vbH = 3000 / camera.zoom;
  const vbX = camera.cx - vbW / 2;
  const vbY = camera.cy - vbH / 2;
  const viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const nodeMap = useMemo(() => {
    const m = new Map<number, TalentNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  // Load data
  const initialDataClass = initialData?.class;
  useEffect(() => {
    if (initial && initial.nodes.length > 0 && initialDataClass === gameClass.slug) {
      setNodes(initial.nodes);
      setEdges(initial.edges);
      setAccentColor(initial.accentColor);
      boundsRef.current = initial.bounds;
      setCamera(initial.camera);
      setAllocated({});
      setHistory([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNodes([]);
    setEdges([]);
    setAllocated({});
    setHistory([]);
    async function load() {
      if (hasRealData(gameClass.slug)) {
        try {
          const res = await fetch(`/data/talents/${gameClass.slug}.json`);
          const data: RealTalentData = await res.json();
          if (cancelled) return;
          const processed = processTalentData(data);
          setNodes(processed.nodes);
          setEdges(processed.edges);
          setAccentColor(processed.accentColor);
          boundsRef.current = processed.bounds;
          setCamera(processed.camera);
        } catch { /* empty */ }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [gameClass, initial, initialDataClass]);

  useEffect(() => { if (nodes.length === 0) return; const h = window.location.hash.slice(1); if (h) setAllocated(decodeAlloc(h)); }, [nodes]);
  useEffect(() => { if (readOnly || nodes.length === 0) return; const enc = encodeAlloc(allocated); const search = window.location.search; window.history.replaceState(null, '', `${window.location.pathname}${search}${enc ? '#' + enc : ''}`); }, [allocated, nodes, readOnly]);
  useEffect(() => { if (readOnly) return; try { setSavedBuildExists(!!localStorage.getItem(`scarshq-talent-${gameClass.slug}`)); } catch {} }, [gameClass.slug, readOnly]);
  useEffect(() => {
    if (readOnly) return;
    try { localStorage.setItem('scarshq-last-class', gameClass.slug); } catch {}
    try { document.cookie = `scarshq-last-class=${gameClass.slug}; path=/; max-age=31536000; SameSite=Lax`; } catch {}
  }, [gameClass.slug, readOnly]);

  const adj = useMemo(() => {
    const m: Record<number, number[]> = {};
    for (const n of nodes) m[n.id] = [];
    for (const e of edges) { m[e.from]?.push(e.to); m[e.to]?.push(e.from); }
    return m;
  }, [nodes, edges]);

  const totalPts = useMemo(() => Object.values(allocated).reduce((s, v) => s + v, 0), [allocated]);
  const startCount = useMemo(() => nodes.filter((n) => n.nodeType === 'start' && (allocated[n.id] || 0) > 0).length, [nodes, allocated]);
  const hasStartAlloc = startCount > 0;

  const canAlloc = useCallback((node: TalentNode): boolean => {
    if ((allocated[node.id] || 0) >= node.maxRank) return false;
    if (totalPts >= MAX_POINTS) return false;
    if (node.nodeType === 'start') {
      if ((allocated[node.id] || 0) === 0 && startCount >= MAX_STARTS) return false;
      return true;
    }
    return (adj[node.id] || []).some((nid) => (allocated[nid] || 0) > 0);
  }, [allocated, adj, startCount, totalPts]);

  const canDealloc = useCallback((node: TalentNode): boolean => {
    return (allocated[node.id] || 0) > 0;
  }, [allocated]);

  const pruneOrphans = useCallback((alloc: Record<number, number>): Record<number, number> => {
    const allocIds = new Set(Object.keys(alloc).filter((k) => alloc[Number(k)] > 0).map(Number));
    const startIds = nodes.filter((n) => n.nodeType === 'start' && allocIds.has(n.id)).map((n) => n.id);
    if (startIds.length === 0) return {};
    const reachable = new Set<number>(startIds);
    const queue: number[] = [...startIds];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const nb of (adj[cur] || [])) {
        if (!allocIds.has(nb) || reachable.has(nb)) continue;
        reachable.add(nb); queue.push(nb);
      }
    }
    const next: Record<number, number> = {};
    for (const id of reachable) next[id] = alloc[id];
    return next;
  }, [adj, nodes]);

  const findShortestPath = useCallback((targetId: number): number[] => {
    if ((allocated[targetId] || 0) > 0) return [];
    const targetNode = nodeMap.get(targetId);
    if (targetNode?.nodeType === 'start') {
      return startCount >= MAX_STARTS ? [] : [targetId];
    }
    const allocatedIds = new Set(Object.keys(allocated).filter((k) => allocated[Number(k)] > 0).map(Number));
    const sourceSet = allocatedIds.size > 0 ? allocatedIds : new Set(nodes.filter((n) => n.nodeType === 'start').map((n) => n.id));
    if (sourceSet.size === 0) return [];
    const visited = new Set<number>([targetId]);
    const parent = new Map<number, number>();
    const queue: number[] = [targetId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (sourceSet.has(cur)) {
        const path: number[] = []; let s = cur;
        if (allocatedIds.size === 0) path.push(cur);
        while (parent.has(s)) { s = parent.get(s)!; path.push(s); }
        return path;
      }
      for (const nb of (adj[cur] || [])) {
        if (visited.has(nb)) continue;
        // Don't path through unallocated start nodes that aren't our chosen start
        const nbNode = nodeMap.get(nb);
        if (nbNode?.nodeType === 'start' && (allocated[nb] || 0) === 0 && allocatedIds.size > 0) continue;
        visited.add(nb); parent.set(nb, cur); queue.push(nb);
      }
    }
    return [];
  }, [allocated, adj, nodes, nodeMap, startCount]);

  const hoveredPath = useMemo(() => {
    if (hoveredId === null || (allocated[hoveredId] || 0) > 0) return new Set<number>();
    return new Set(findShortestPath(hoveredId));
  }, [hoveredId, findShortestPath, allocated]);

  // Event delegation for nodes - avoids per-node React handlers
  const allocatedRef = useRef(allocated);
  allocatedRef.current = allocated;

  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    const nid = getNodeId(e.target as Element);
    if (nid === null) return;
    const node = nodeMap.get(nid);
    if (!node) return;
    if ((allocatedRef.current[nid] || 0) > 0) {
      // Already allocated - increment
      if (canAlloc(node)) {
        setHistory((h) => [...h, allocatedRef.current].slice(-100));
        setAllocated((p) => ({ ...p, [nid]: (p[nid] || 0) + 1 }));
      }
    } else {
      const path = findShortestPath(nid);
      if (path.length === 0) return;
      setHistory((h) => [...h, allocatedRef.current].slice(-100));
      setAllocated((prev) => { const next = { ...prev }; for (const id of path) next[id] = Math.max(next[id] || 0, 1); return next; });
    }
  }, [nodeMap, canAlloc, findShortestPath]);

  const handleNodeContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const nid = getNodeId(e.target as Element);
    if (nid === null) return;
    const node = nodeMap.get(nid);
    if (node && canDealloc(node)) {
      setHistory((h) => [...h, allocatedRef.current].slice(-100));
      setAllocated((p) => {
        const n = { ...p };
        const c = (n[nid] || 0) - 1;
        if (c <= 0) { delete n[nid]; return pruneOrphans(n); }
        n[nid] = c;
        return n;
      });
    }
  }, [nodeMap, canDealloc, pruneOrphans]);

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setAllocated(prev);
      return h.slice(0, -1);
    });
  }

  const handleNodeHover = useCallback((e: React.MouseEvent) => {
    const nid = getNodeId(e.target as Element);
    setHoveredId(nid);
    if (nid != null && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
    }
  }, []);
  const handleNodeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  function reset() { setAllocated({}); setBuildEquipment({}); }
  function resetView() {
    if (nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) { minX = Math.min(minX, n.dx); maxX = Math.max(maxX, n.dx); minY = Math.min(minY, n.dy); maxY = Math.max(maxY, n.dy); }
    animateZoom({ cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, zoom: Math.min(4000 / (maxX - minX + 400), 3000 / (maxY - minY + 400)) });
  }
  // Encode equipment to JSON: { "Helmet": "item-123", "Boots": "item-456" }
  function encodeEquipment(eq: EquippedItems): string {
    const map: Record<string, string> = {};
    for (const [slot, item] of Object.entries(eq)) {
      if (item) map[slot] = item.id;
    }
    return Object.keys(map).length > 0 ? JSON.stringify(map) : '';
  }

  async function handleSaveBuild() {
    const enc = encodeAlloc(allocated);
    if (!enc) return;
    setSaving(true); setCloudError(null);
    const equipmentJson = encodeEquipment(buildEquipment);
    // Cloud save
    try {
      const res = await fetch('/api/builds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classSlug: gameClass.slug, allocation: enc, equipment: equipmentJson || undefined, name: saveName.trim() || undefined, tags: saveTags.length > 0 ? saveTags : undefined, difficulty: saveDifficulty || undefined, description: saveDescription.trim() || undefined, guide: saveGuide.trim() || undefined, patch: 'Spring 2026 Playtest' }) });
      const data = await res.json();
      if (res.ok && data.code) {
        setCloudCode(data.code);
      } else {
        if (data.code === 'NOT_SIGNED_IN') {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        if (data.code === 'NEED_DISPLAY_NAME') {
          window.location.href = `/onboarding?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        setCloudError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }
    } catch { setCloudError('Network error'); setSaving(false); return; }
    // Local save
    saveBuildToStorage({
      name: saveName.trim() || `${gameClass.name} Build`,
      classSlug: gameClass.slug,
      type: 'talent' as BuildType,
      allocation: enc,
      totalPoints: totalPts,
      cloudCode: cloudCode || undefined,
    });
    try { localStorage.setItem(`scarshq-talent-${gameClass.slug}`, enc); setSavedBuildExists(true); } catch {}
    setSaving(false);
  }
  function loadBuild() { try { const saved = localStorage.getItem(`scarshq-talent-${gameClass.slug}`); if (saved) setAllocated(decodeAlloc(saved)); } catch {} }

  // Load equipment from JSON string: fetch each item by ID
  async function loadEquipmentFromJson(json: string) {
    if (!json) return;
    try {
      const map: Record<string, string> = JSON.parse(json);
      const entries = Object.entries(map);
      if (entries.length === 0) return;
      // Fetch all items in parallel
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
      for (const result of results) {
        if (result) eq[result[0]] = result[1];
      }
      setBuildEquipment(eq);
    } catch { /* invalid JSON, ignore */ }
  }

  // Apply initial allocation for read-only embeds
  useEffect(() => {
    if (nodes.length === 0) return;
    if (readOnly && initialAllocation) {
      setAllocated(decodeAlloc(initialAllocation));
      return;
    }
    const buildCode = new URLSearchParams(window.location.search).get('build');
    if (buildCode) {
      fetch(`/api/builds/${encodeURIComponent(buildCode)}`).then((r) => r.json()).then((data) => {
        if (data.allocation && data.classSlug === gameClass.slug) {
          setAllocated(decodeAlloc(data.allocation));
          setCloudCode(data.code);
          if (data.name) setBuildName(data.name);
          if (data.equipment) loadEquipmentFromJson(data.equipment);
        }
      }).catch(() => {});
    }
  }, [nodes.length, gameClass.slug]);


  async function importBuild() {
    const code = importCode.trim(); if (!code) return; setImportError(null);
    try { const res = await fetch(`/api/builds/${encodeURIComponent(code)}`); const data = await res.json();
      if (res.ok && data.allocation) { if (data.classSlug !== gameClass.slug) { setImportError(`This build is for ${data.classSlug}, not ${gameClass.slug}`); return; }
        setAllocated(decodeAlloc(data.allocation)); setCloudCode(data.code); if (data.name) setBuildName(data.name); if (data.equipment) loadEquipmentFromJson(data.equipment); setShowImportModal(false); setImportCode('');
      } else setImportError(data.error || 'Build not found');
    } catch { setImportError('Network error'); }
  }

  async function fetchBrowserBuilds(page: number, classSlug: string, mine: boolean, sort: string = browserSort) {
    setBrowserLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), sort });
      if (classSlug !== 'all') params.set('class', classSlug);
      if (mine) params.set('mine', 'true');
      const res = await fetch(`/api/builds?${params}`);
      const data = await res.json();
      if (res.ok) {
        setBrowserBuilds(data.builds);
        setBrowserTotal(data.total);
        setBrowserPage(data.page);
        setBrowserPages(data.pages);
      }
    } catch { /* empty */ }
    setBrowserLoading(false);
  }

  function openBuildBrowser(mode: 'all' | 'mine') {
    setShowLoadModal(false);
    setShowBuildBrowser(mode);
    setBrowserClass(gameClass.slug);
    setBrowserPage(1);
    setBrowserSort('newest');
    fetchBrowserBuilds(1, gameClass.slug, mode === 'mine', 'newest');
  }

  function loadFromCode(code: string) {
    fetch(`/api/builds/${encodeURIComponent(code)}`).then((r) => r.json()).then((data) => {
      if (data.allocation && data.classSlug === gameClass.slug) {
        setAllocated(decodeAlloc(data.allocation));
        setCloudCode(data.code);
        if (data.name) setBuildName(data.name);
        setShowBuildBrowser(null);
      } else if (data.allocation) {
        // Different class - navigate there
        window.location.href = `/talents/${data.classSlug}?build=${code}`;
      }
    }).catch(() => {});
  }

  function copyBuildLink() {
    if (!cloudCode) return;
    navigator.clipboard.writeText(`${window.location.origin}/talents/${gameClass.slug}?build=${cloudCode}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  // Zoom wheel
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault(); e.stopPropagation();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      const base = zoomTargetRef.current || cameraRef.current;
      const newZoom = Math.max(0.15, Math.min(15, base.zoom * factor));
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width, my = (e.clientY - rect.top) / rect.height;
        const oldW = 4000 / base.zoom, oldH = 3000 / base.zoom, newW = 4000 / newZoom, newH = 3000 / newZoom;
        const worldX = base.cx - oldW / 2 + mx * oldW, worldY = base.cy - oldH / 2 + my * oldH;
        animateZoom({ cx: worldX - (mx - 0.5) * newW, cy: worldY - (my - 0.5) * newH, zoom: newZoom });
      } else animateZoom({ ...base, zoom: newZoom });
    }
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [loading, animateZoom]);

  // Pan - fully native, no React renders during drag
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    function onDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const tag = (e.target as Element).tagName.toLowerCase();
      if (tag === 'svg' || tag === 'rect' || tag === 'circle' || tag === 'line' || tag === 'path' || (e.target as Element).classList.contains('bg-rect')) {
        isPanningRef.current = true; setPanning(true);
        const c = cameraRef.current;
        panRef.current = { mx: e.clientX, my: e.clientY, cx: c.cx, cy: c.cy };
      }
    }
    function onMove(e: MouseEvent) {
      if (!isPanningRef.current) return;
      if (panFrameRef.current) return;
      const cx = e.clientX, cy = e.clientY;
      panFrameRef.current = requestAnimationFrame(() => {
        panFrameRef.current = 0;
        const svg = svgRef.current; if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const z = cameraRef.current.zoom, w = 4000 / z, h = 3000 / z;
        const rawCx = panRef.current.cx - (cx - panRef.current.mx) * (w / rect.width);
        const rawCy = panRef.current.cy - (cy - panRef.current.my) * (h / rect.height);
        const clamped = clampCamera(rawCx, rawCy, z);
        svg.setAttribute('viewBox', `${clamped.cx - w / 2} ${clamped.cy - h / 2} ${w} ${h}`);
      });
    }
    function onUp() {
      if (!isPanningRef.current) return;
      isPanningRef.current = false; setPanning(false);
      const svg = svgRef.current;
      if (svg) { const vb = svg.getAttribute('viewBox')?.split(' ').map(Number);
        if (vb && vb.length === 4) setCamera(clampCamera(vb[0] + vb[2] / 2, vb[1] + vb[3] / 2, cameraRef.current.zoom));
      }
    }
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { el.removeEventListener('mousedown', onDown); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [loading]);

  function zoomIn() { const b = zoomTargetRef.current || camera; animateZoom({ ...b, zoom: Math.min(15, b.zoom * 1.3) }); }
  function zoomOut() { const b = zoomTargetRef.current || camera; animateZoom({ ...b, zoom: Math.max(0.15, b.zoom * 0.7) }); }

  const hovered = hoveredId != null ? nodeMap.get(hoveredId) ?? null : null;
  const col = accentColor;
  const allocatedNodes = useMemo(() => nodes.filter((n) => (allocated[n.id] || 0) > 0), [nodes, allocated]);

  const startCircle = useMemo(() => {
    const sn = nodes.filter((n) => n.nodeType === 'start');
    if (sn.length === 0) return null;
    const ax = sn.reduce((s, n) => s + n.dx, 0) / sn.length;
    const ay = sn.reduce((s, n) => s + n.dy, 0) / sn.length;
    return { cx: ax, cy: ay, r: Math.max(...sn.map((n) => Math.hypot(n.dx - ax, n.dy - ay))) };
  }, [nodes]);

  // Pre-build edge SVG as 3-part composite lines: outer pair + middle
  const edgeSvg = useMemo(() => {
    const lines: string[] = [];
    for (const e of edges) {
      const a = nodeMap.get(e.from), b = nodeMap.get(e.to);
      if (!a || !b) continue;
      const aA = (allocated[a.id] || 0) > 0, bA = (allocated[b.id] || 0) > 0;
      const both = aA && bA, one = aA || bA;
      const aP = hoveredPath.has(a.id), bP = hoveredPath.has(b.id);
      const onPath = hoveredPath.size > 0 && (aP || bP) && (aP || aA) && (bP || bA);
      const coords = `x1="${a.dx}" y1="${a.dy}" x2="${b.dx}" y2="${b.dy}"`;

      if (onPath) {
        // Highlighting path to pick - orange outer, gap visible (no middle fill)
        lines.push(`<line ${coords} stroke="#e8922d" stroke-width="10" opacity="0.9" stroke-linecap="round"/>`);
        lines.push(`<line ${coords} stroke="#000000" stroke-width="5" opacity="0.95" stroke-linecap="round"/>`);
      } else if (both) {
        // Fully selected - soft green outer, darker green middle
        lines.push(`<line ${coords} stroke="#86d8af" stroke-width="10" opacity="0.8" stroke-linecap="round"/>`);
        lines.push(`<line ${coords} stroke="#2a5e42" stroke-width="3" opacity="0.9" stroke-linecap="round"/>`);

      } else if (one) {
        // One side allocated - dim
        lines.push(`<line ${coords} stroke="#3a3a4a" stroke-width="5" opacity="0.6" stroke-linecap="round"/>`);
        lines.push(`<line ${coords} stroke="#222230" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>`);
      } else {
        // Default - subtle
        lines.push(`<line ${coords} stroke="#2a2a3a" stroke-width="5" opacity="0.8" stroke-linecap="round"/>`);
        lines.push(`<line ${coords} stroke="#151520" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>`);
      }
    }
    return lines.join('');
  }, [edges, nodeMap, allocated, hoveredPath]);

  return (
    <div className={`flex flex-col ${readOnly ? 'h-full' : 'h-[calc(100vh-49px)] md:h-[calc(100vh-95px)]'}`}>

      {/* Sub-header: Tabs (hidden in read-only) */}
      {!readOnly && <div className="relative z-20 bg-[#171b24] border-b border-border-subtle grid grid-cols-[1fr_auto_1fr] items-center px-8 sm:px-12 gap-4">
        <div className="flex items-center gap-5 py-2 text-[#fffede]">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs uppercase tracking-wider text-white">Key Passives</span>
            <img src="/icons/talents/scars icon 1.avif" alt="" aria-hidden className="w-9 h-9 select-none" />
            <img src="/icons/talents/scars icon 1.avif" alt="" aria-hidden className="w-9 h-9 select-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs uppercase tracking-wider text-white">Active Talents</span>
            <img src="/icons/talents/scars icon 2.avif" alt="" aria-hidden className="w-9 h-9 select-none" />
            <img src="/icons/talents/scars icon 2.avif" alt="" aria-hidden className="w-9 h-9 select-none" />
          </div>
        </div>
        <div className="inline-grid grid-cols-3">
          {['Equipment', 'Talents', 'Scars'].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-center w-[141px] pt-[13px] pb-[10px] text-[17px] font-heading transition-colors relative text-[#fffede] ${
                  active ? '' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, #347ba9 0%, rgba(52,123,169,0.5) 30%, transparent 70%)' }}
                  />
                )}
                {active && (
                  <img
                    src="/Icons/UI/category-highlighter-bg.png"
                    alt=""
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] max-w-none pointer-events-none select-none opacity-40"
                  />
                )}
                <span className="relative z-10">{tab}</span>
                {active && (
                  <img
                    src="/Icons/UI/category-highlighter.png"
                    alt=""
                    aria-hidden
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[50%] w-[82%] max-w-none pointer-events-none select-none opacity-95 z-30"
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end items-center gap-3 pr-1 relative">
          <button
            type="button"
            onClick={() => { if (totalPts > 0) setShowRefundConfirm(true); }}
            className="px-4 py-2 text-xs font-heading uppercase tracking-wider text-[#fffede] bg-dark-surface/60 border border-border-subtle rounded hover:bg-dark-surface transition-colors"
          >
            Refund Build
          </button>
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
            </svg>
            <input
              type="text"
              value={talentSearch}
              onChange={(e) => { setTalentSearch(e.target.value); setShowTalentSearch(true); }}
              onFocus={() => setShowTalentSearch(true)}
              placeholder="Search Talents..."
              className="w-full bg-dark-surface/60 border border-border-subtle rounded pl-9 pr-3 py-2 text-sm text-[#fffede] placeholder:text-text-muted focus:outline-none focus:border-honor-gold"
            />
          </div>
          {showTalentSearch && talentSearch.trim() && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-[#171b24] border border-border-subtle rounded-lg shadow-xl p-2 z-40 max-h-64 overflow-y-auto">
              {nodes
                .filter((n) => n.name && n.name.toLowerCase().includes(talentSearch.trim().toLowerCase()))
                .slice(0, 30)
                .map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      animateZoom({ cx: n.dx, cy: n.dy, zoom: 2 });
                      setHoveredId(n.id);
                      setShowTalentSearch(false);
                      setTalentSearch('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-[#fffede] hover:bg-white/5 rounded transition-colors"
                  >
                    <div className="font-heading">{n.name}</div>
                    <div className="text-xs text-text-muted capitalize">{n.nodeType}</div>
                  </button>
                ))}
              {nodes.filter((n) => n.name && n.name.toLowerCase().includes(talentSearch.trim().toLowerCase())).length === 0 && (
                <div className="px-3 py-2 text-sm text-text-muted">No talents found.</div>
              )}
            </div>
          )}
        </div>
      </div>}

      {/* Equipment Builder tab */}
      {!readOnly && activeTab === 'Equipment' && (
        <div className="flex-1 overflow-y-auto bg-void-black">
          <GearPlanner equipped={buildEquipment} onEquippedChange={setBuildEquipment} />
        </div>
      )}

      {/* Scars tab */}
      {!readOnly && activeTab === 'Scars' && (
        <div className="flex-1 overflow-y-auto bg-void-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-heading text-2xl text-honor-gold mb-2">Scars</h2>
            <p className="text-text-secondary text-sm mb-8 max-w-2xl">
              Scars are permanent marks earned through gameplay achievements. Unlike talents that can be respecced, Scars are forever — choose wisely.
            </p>

            {/* Scar Slots */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { name: 'PvE Scar', desc: 'Earned through dungeon mastery and boss kills' },
                { name: 'PvP Scar', desc: 'Earned through arena victories and battleground dominance' },
                { name: 'Exploration Scar', desc: 'Earned through world discovery and hidden secrets' },
                { name: 'Crafting Scar', desc: 'Earned through crafting mastery and rare creations' },
                { name: 'Achievement Scar', desc: 'Earned through unique feats and milestones' },
                { name: 'Legacy Scar', desc: 'Earned through long-term dedication and progression' },
              ].map((scar) => (
                <div key={scar.name} className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-start gap-4 hover:border-honor-gold-dim transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-dark-surface border border-border-subtle flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-honor-gold rotate-45" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-sm text-text-primary mb-1">{scar.name}</h3>
                    <p className="text-xs text-text-muted">{scar.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-dark-surface rounded-full overflow-hidden">
                        <div className="h-full bg-border-subtle rounded-full" style={{ width: '0%' }} />
                      </div>
                      <span className="text-[10px] text-text-muted">Locked</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-6">
              <h3 className="font-heading text-lg text-honor-gold mb-4">How Scars Work</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-honor-gold text-sm mt-0.5">1.</span>
                  <p className="text-sm text-text-secondary"><strong className="text-text-primary">Earn through gameplay</strong> — Complete achievements, conquer challenges, and reach milestones to unlock Scar choices.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-honor-gold text-sm mt-0.5">2.</span>
                  <p className="text-sm text-text-secondary"><strong className="text-text-primary">Choose your mark</strong> — Each Scar slot presents a meaningful choice between different bonuses and effects.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-honor-gold text-sm mt-0.5">3.</span>
                  <p className="text-sm text-text-secondary"><strong className="text-text-primary">Permanent decision</strong> — Once chosen, a Scar cannot be changed. It becomes part of your character&apos;s identity.</p>
                </div>
              </div>
            </div>

            <div className="bg-honor-gold/5 border border-honor-gold/20 rounded-lg p-5 text-center">
              <p className="text-sm text-text-secondary">
                <strong className="text-honor-gold">Coming Soon</strong> — Specific Scar options and their effects will be added as more information becomes available from playtests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SVG canvas */}
      <div ref={containerRef} className={`flex-1 relative bg-[#0d0d0d] overflow-hidden ${!readOnly && activeTab !== 'Talents' ? 'hidden' : ''}`}>
        <svg ref={svgRef} viewBox={viewBox} className="w-full h-full select-none" style={{ cursor: panning ? 'grabbing' : 'grab', willChange: 'viewBox' }} shapeRendering="geometricPrecision">
          <rect className="bg-rect" x={vbX - 5000} y={vbY - 5000} width={vbW + 10000} height={vbH + 10000} fill="#0d0d0d" />
          {/* Sparse starfield */}
          <g className="stars">
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
            ))}
          </g>
          <defs>
            <radialGradient id="ng-a" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={col} stopOpacity={0.35} /><stop offset="60%" stopColor={col} stopOpacity={0.15} /><stop offset="100%" stopColor={col} stopOpacity={0.05} /></radialGradient>
            <radialGradient id="ng-m" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={col} stopOpacity={0.5} /><stop offset="50%" stopColor={col} stopOpacity={0.25} /><stop offset="100%" stopColor={col} stopOpacity={0.08} /></radialGradient>
            <radialGradient id="ng-p" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={PG} stopOpacity={0.3} /><stop offset="60%" stopColor={PG} stopOpacity={0.1} /><stop offset="100%" stopColor={PG} stopOpacity={0.02} /></radialGradient>
            <radialGradient id="ng-u" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#222233" stopOpacity={0.8} /><stop offset="100%" stopColor="#0a0a12" stopOpacity={0.9} /></radialGradient>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={PG} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#e8c432" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-turquoise" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor="#22cccc" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="tint-green" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.3 0 0 0 0.2  0 0.6 0 0 0.55  0 0 0.3 0 0.4  0 0 0 1 0" />
            </filter>
            {/* Shared icon clip paths per node type */}
            {Object.entries(SIZE).filter(([t]) => t !== 'active').map(([type, r]) => (
              <clipPath key={type} id={`icon-clip-${type}`}><circle r={r * 0.46} /></clipPath>
            ))}
          </defs>

          {/* Grid rings */}
          <circle cx={0} cy={0} r={300} fill="none" stroke="#1a1a30" strokeWidth={0.5} />
          <circle cx={0} cy={0} r={700} fill="none" stroke="#1a1a30" strokeWidth={0.5} />
          <circle cx={0} cy={0} r={1200} fill="none" stroke="#1a1a30" strokeWidth={0.5} />
          <circle cx={0} cy={0} r={1800} fill="none" stroke="#1a1a30" strokeWidth={0.5} />
          <circle cx={0} cy={0} r={2500} fill="none" stroke="#1a1a30" strokeWidth={0.5} />

          {/* Start circle */}
          {startCircle && <>
            <radialGradient id="turq-inner-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22cccc" stopOpacity={0} />
              <stop offset="80%" stopColor="#22cccc" stopOpacity={0} />
              <stop offset="90%" stopColor="#22cccc" stopOpacity={0.1} />
              <stop offset="96%" stopColor="#22cccc" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22cccc" stopOpacity={0.45} />
            </radialGradient>
            <circle cx={startCircle.cx} cy={startCircle.cy} r={startCircle.r} fill="url(#turq-inner-glow)" />
            <circle cx={startCircle.cx} cy={startCircle.cy} r={startCircle.r} fill="none" stroke="#111111" strokeWidth={2} opacity={0.8} />
            <circle cx={startCircle.cx} cy={startCircle.cy} r={startCircle.r} fill="none" stroke="#22cccc" strokeWidth={1} opacity={0.3} />
          </>}

          {/* Edges - raw innerHTML for perf */}
          <g dangerouslySetInnerHTML={{ __html: edgeSvg }} />

          {/* Class icon in center - above edges, below nodes */}
          {startCircle && (() => { const s = startCircle.r * 1.2; return (
            <image href={gameClass.icon} x={startCircle.cx - s} y={startCircle.cy - s} width={s * 2} height={s * 2} opacity={1} pointerEvents="none" />
          ); })()}

          {/* Nodes - event delegation via parent g */}
          <g onClick={handleNodeClick} onContextMenu={handleNodeContext} onMouseOver={handleNodeHover} onMouseMove={handleNodeMouseMove} onMouseOut={() => setHoveredId(null)}>
            {nodes.map((node) => {
              const cur = allocated[node.id] || 0;
              const isA = cur > 0, isM = cur >= node.maxRank;
              const isH = hoveredId === node.id, isP = hoveredPath.has(node.id);
              const isSH = node.nodeType === 'start' && !isA && !hasStartAlloc;
              const r = SIZE[node.nodeType] || 12;
              const sc = isP ? PG : isSH ? PG : isA ? col : '#d9d9d9';
              const fi = isM ? 'url(#ng-m)' : isP ? 'url(#ng-p)' : isSH ? 'url(#ng-p)' : isA ? 'url(#ng-a)' : 'url(#ng-u)';
              const sw = isA || isP ? 2 : 1.5;

              return (
                <g key={node.id} data-nid={node.id} transform={`translate(${node.dx},${node.dy})`} className="cursor-pointer">
                  {(isP || isSH) && <circle r={r + 8} fill={PG} opacity={0.07} />}
                  {isH && !isM && !isP && <circle r={r + 6} fill="none" stroke={isA ? col : '#aaa'} strokeWidth={1} opacity={0.3} />}
                  {node.nodeType === 'active' ? (
                    <>
                      <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="transparent" />
                      {isA && <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="none" filter="url(#glow-green)" />}
                      {isH && !isA && <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="none" filter="url(#glow-yellow)" />}
                      <image href={node.iconUrl || SQUARE_ICON_PLACEHOLDER} x={-r} y={-r} width={r * 2} height={r * 2} opacity={isA ? 1 : isP || isSH ? 0.8 : 0.6} pointerEvents="none" filter={isA ? 'url(#tint-green)' : undefined} />
                      {(isP || isSH) && <rect x={-r * 0.9} y={-r * 0.9} width={r * 1.8} height={r * 1.8} fill={PG} opacity={0.15} pointerEvents="none" />}
                      {isA && <rect x={-r * 0.9} y={-r * 0.9} width={r * 1.8} height={r * 1.8} fill={PG} opacity={0.2} pointerEvents="none" />}
                    </>
                  ) : (() => {
                    const abilityIcon = node.iconUrl || (TEST_ABILITY_NODE_IDS.has(node.id) ? TEST_ABILITY_ICON : null);
                    return (
                      <>
                        <circle r={r} fill="transparent" />
                        {isA && <circle r={r} fill="none" stroke="none" filter="url(#glow-green)" pointerEvents="none" />}
                        {isH && !isA && <circle r={r} fill="none" stroke="none" filter="url(#glow-yellow)" pointerEvents="none" />}
                        {/* Outer notched shape - always shown */}
                        <image href={ROUND_ICON_PLACEHOLDER} x={-r} y={-r} width={r * 2} height={r * 2} opacity={isA ? 1 : isP || isSH ? 0.8 : 0.6} pointerEvents="none" filter={isA ? 'url(#tint-green)' : undefined} />
                        {/* Ability icon inside the inner circle */}
                        {abilityIcon && (
                          <>
                            <clipPath id={`ability-clip-${node.id}`}><circle r={r * 0.525} /></clipPath>
                            <circle r={r * 0.525} fill="#0a0a12" pointerEvents="none" />
                            <image href={abilityIcon} x={-r * 0.475} y={-r * 0.475} width={r * 0.95} height={r * 0.95} clipPath={`url(#ability-clip-${node.id})`} opacity={isA ? 1 : 0.7} pointerEvents="none" />
                          </>
                        )}
                        {(isP || isSH) && <circle r={r * 0.9} fill={PG} opacity={0.15} pointerEvents="none" />}
                        {isA && <circle r={r * 0.9} fill={PG} opacity={0.2} pointerEvents="none" />}
                      </>
                    );
                  })()}
                  {node.maxRank > 1 && (isA || isH) && (
                    <text y={r + 12} textAnchor="middle" fontSize={9} fill={isM ? col : '#888'} fontFamily="DM Sans,sans-serif" pointerEvents="none">{cur}/{node.maxRank}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute bg-[#12122a]/95 border border-border-subtle rounded-lg p-3 shadow-xl max-w-xs pointer-events-none z-10 backdrop-blur-sm" style={{ left: mousePos.x + 16, top: mousePos.y + 16 }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-text-primary">{hovered.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: col + '20', color: col }}>{hovered.nodeType}</span>
            </div>
            {hovered.description && <p className="text-[11px] text-text-muted mb-1.5">{hovered.description}</p>}
            <span className="text-[10px]" style={{ color: col }}>Rank {allocated[hovered.id] || 0}/{hovered.maxRank}</span>
          </div>
        )}
        {(() => {
          const minZ = 0.15, maxZ = 15;
          const t = Math.max(0, Math.min(1, (Math.log(camera.zoom) - Math.log(minZ)) / (Math.log(maxZ) - Math.log(minZ))));
          const fillOpacity = 0.25 + t * 0.75;
          return (
            <>
              <div className="absolute bottom-3 right-3 flex items-center gap-0">
                <button
                  onClick={zoomOut}
                  aria-label="Zoom out"
                  className="w-7 h-7 rotate-45 bg-[#12122a]/90 border border-border-subtle hover:border-honor-gold transition-colors flex items-center justify-center"
                >
                  <span className="-rotate-45 text-text-muted text-base leading-none">−</span>
                </button>
                <div className="relative w-20 h-[3px] bg-dark-surface mx-1.5 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 transition-all duration-200"
                    style={{ width: `${t * 100}%`, background: '#c8a84e', opacity: fillOpacity, boxShadow: `0 0 ${4 + t * 8}px rgba(200,168,78,${fillOpacity})` }}
                  />
                </div>
                <button
                  onClick={zoomIn}
                  aria-label="Zoom in"
                  className="w-7 h-7 rotate-45 bg-[#12122a]/90 border border-border-subtle hover:border-honor-gold transition-colors flex items-center justify-center"
                >
                  <span className="-rotate-45 text-text-muted text-base leading-none">+</span>
                </button>
              </div>
              <button
                onClick={resetView}
                title="Fit to view"
                className="absolute bottom-3 left-3 w-7 h-7 rotate-45 bg-[#12122a]/90 border border-border-subtle hover:border-honor-gold transition-colors flex items-center justify-center"
              >
                <span className="-rotate-45 text-text-muted text-[10px] leading-none">⊡</span>
              </button>
            </>
          );
        })()}
      </div>

        {/* Read-only Bottom Panel — sits half in, half out */}
        {readOnly && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 bg-[#14141a] border border-border-subtle rounded-full px-7 py-3 flex items-center gap-4 shadow-2xl whitespace-nowrap">
            <img src={gameClass.icon} alt={gameClass.name} className="w-8 h-8" />
            <span style={{ color: col }} className="font-heading text-lg">{gameClass.name}</span>
            <span className="text-text-muted text-sm">|</span>
            <span className="font-heading text-lg" style={{ color: col }}>{totalPts}<span className="text-text-muted text-sm">/{MAX_POINTS} pts</span></span>
            <span className="text-text-muted text-sm">|</span>
            <a href={`/talents/${gameClass.slug}${buildCodeProp ? `?build=${buildCodeProp}` : ''}`} className="text-lg text-honor-gold hover:text-honor-gold-light font-heading transition-colors">Edit</a>
          </div>
        )}

        {/* Floating Bottom Panel */}
        {!readOnly && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-[#171b24] backdrop-blur-md border border-black rounded-xl px-3 py-2 flex items-center gap-3 shadow-2xl">
          {/* Class dropdown */}
          <div className="relative">
            <button onClick={() => setShowClassDropdown(!showClassDropdown)} className="flex items-center gap-2 px-4 py-2 bg-[#0f1f2c] border border-[#2a4a64] rounded-lg text-sm hover:border-honor-gold-dim transition-colors">
              <img src={gameClass.icon} alt={gameClass.name} className="w-7 h-7" />
              <span style={{ color: col }} className="font-heading">{gameClass.name}</span>
              <span className="text-text-muted text-xs">▼</span>
            </button>
            {showClassDropdown && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#171b24]/95 border border-[#2a4a64] rounded-lg py-1.5 shadow-2xl backdrop-blur-md w-48">
                {[...classes].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                  <Link key={c.slug} href={`/talents/${c.slug}`} onClick={() => setShowClassDropdown(false)}
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-honor-gold/10 transition-colors ${c.slug === gameClass.slug ? 'text-honor-gold' : 'text-text-secondary'}`}>
                    <img src={c.icon} alt={c.name} className="w-6 h-6" /><span>{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-[#2a4a64]/60" />

          {/* Points */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-xs text-text-muted">PTS</span>
            <span className="font-heading text-xl" style={{ color: totalPts >= MAX_POINTS ? '#ef4444' : col }}>{totalPts}</span>
            <span className="text-text-muted text-sm">/{MAX_POINTS}</span>
          </div>

          <div className="w-px h-8 bg-[#2a4a64]/60" />

          {/* Actions */}
          <button onClick={() => { if (totalPts > 0) { setSaveName(''); setSaveTags([]); setSaveDifficulty(''); setSaveDescription(''); setSaveGuide(''); setShowGuideEditor(false); setProfanityWarning(null); setShowSaveModal(true); } }} className={`px-4 py-2 rounded-lg text-sm transition-colors border ${totalPts > 0 ? 'bg-[#0f1f2c] border-[#2a4a64] text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim' : 'bg-[#0f1f2c] border-[#2a4a64] text-text-muted cursor-not-allowed opacity-50'}`} disabled={totalPts === 0}>Save</button>
          <button onClick={() => { setImportError(null); setShowLoadModal(true); }} className="px-4 py-2 bg-[#0f1f2c] border border-[#2a4a64] rounded-lg text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors">Load</button>
          <button onClick={undo} disabled={history.length === 0} className={`px-4 py-2 rounded-lg text-sm transition-colors border ${history.length > 0 ? 'bg-[#0f1f2c] border-[#2a4a64] text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim' : 'bg-[#0f1f2c] border-[#2a4a64] text-text-muted cursor-not-allowed opacity-50'}`}>Undo</button>
        </div>}

      {/* Save Modal */}
      {!readOnly && showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowSaveModal(false); setCloudCode(null); setCloudError(null); }}>
          <div className={`bg-deep-night border border-border-subtle rounded-lg p-6 w-full shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${showGuideEditor ? 'max-w-2xl' : 'max-w-sm'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-honor-gold mb-4">{isBanned ? 'Account Restricted' : cloudCode ? 'Build Saved!' : 'Save Build'}</h3>
            {isBanned ? (
              <div className="space-y-3">
                <div className="bg-scar-red/10 border border-scar-red/30 rounded-lg p-4">
                  <p className="text-sm text-scar-red-light font-medium mb-2">Your account has been restricted</p>
                  <p className="text-xs text-text-secondary">Due to a policy violation, your account has been restricted from creating or sharing builds. You can still browse the site, view builds, and use the talent calculator.</p>
                  <p className="text-xs text-text-muted mt-2">If you believe this is a mistake, please contact us via Discord.</p>
                </div>
                <button onClick={() => setShowSaveModal(false)} className="w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">Close</button>
              </div>
            ) : cloudCode ? (
              <div className="space-y-3">
                <div><label className="text-xs text-text-muted block mb-1">Import Code</label>
                  <div className="flex gap-2"><input type="text" value={cloudCode} readOnly className="flex-1 bg-dark-surface border border-border-subtle rounded px-3 py-2 text-sm text-honor-gold font-mono" />
                    <button onClick={() => { navigator.clipboard.writeText(cloudCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-3 py-2 bg-dark-surface border border-border-subtle rounded text-xs text-text-secondary hover:text-honor-gold transition-colors">{copied ? 'Copied!' : 'Copy'}</button></div></div>
                <div><label className="text-xs text-text-muted block mb-1">Build Link</label>
                  <div className="flex gap-2"><input type="text" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/talents/${gameClass.slug}?build=${cloudCode}`} readOnly className="flex-1 bg-dark-surface border border-border-subtle rounded px-3 py-2 text-xs text-text-secondary font-mono truncate" />
                    <button onClick={copyBuildLink} className="px-3 py-2 bg-honor-gold/10 border border-honor-gold-dim rounded text-xs text-honor-gold hover:bg-honor-gold/20 transition-colors whitespace-nowrap">Copy Link</button></div></div>
                <a href={`/builds/edit/${cloudCode}`} className="block w-full py-2 bg-honor-gold text-void-black font-heading font-semibold rounded hover:bg-honor-gold-light transition-colors text-sm text-center mt-1">Edit Full Guide</a>
                <button onClick={() => { setShowSaveModal(false); setCloudCode(null); }} className="w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mt-2">Close</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Build Name</label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => { setSaveName(e.target.value); setProfanityWarning(checkProfanity(e.target.value) || checkProfanity(saveDescription)); }}
                    maxLength={50}
                    placeholder={`e.g. ${gameClass.name} PvP Tank`}
                    className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${checkProfanity(saveName) ? 'border-scar-red/50 focus:border-scar-red' : 'border-border-subtle focus:border-honor-gold-dim'}`}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {(['pvp', 'pve', 'leveling', 'beginner'] as const).map((tag) => {
                      const active = saveTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSaveTags((prev) => active ? prev.filter((t) => t !== tag) : [...prev, tag])}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                            active
                              ? 'bg-honor-gold/15 border-honor-gold text-honor-gold'
                              : 'bg-dark-surface border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle'
                          }`}
                        >
                          {tag === 'pvp' ? 'PvP' : tag === 'pve' ? 'PvE' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => {
                      const active = saveDifficulty === diff;
                      const colors: Record<string, string> = { easy: 'bg-emerald-500/15 border-emerald-400 text-emerald-400', medium: 'bg-honor-gold/15 border-honor-gold text-honor-gold', hard: 'bg-scar-red/15 border-scar-red text-scar-red-light' };
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSaveDifficulty(active ? '' : diff)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                            active ? colors[diff] : 'bg-dark-surface border-border-subtle text-text-muted hover:text-text-secondary hover:border-border-subtle'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Description <span className="text-text-muted/50">(optional)</span></label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => { setSaveDescription(e.target.value); setProfanityWarning(checkProfanity(saveName) || checkProfanity(e.target.value)); }}
                    maxLength={500}
                    rows={3}
                    placeholder="Describe your build, playstyle, key talents..."
                    className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none ${checkProfanity(saveDescription) ? 'border-scar-red/50 focus:border-scar-red' : 'border-border-subtle focus:border-honor-gold-dim'}`}
                  />
                  <div className="text-right text-[10px] text-text-muted mt-0.5">{saveDescription.length}/500</div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowGuideEditor(!showGuideEditor)}
                    className="text-xs text-honor-gold hover:text-honor-gold-light transition-colors flex items-center gap-1"
                  >
                    <svg className={`w-3 h-3 transition-transform ${showGuideEditor ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {showGuideEditor ? 'Hide full guide' : 'Write a full guide'} <span className="text-text-muted/50">(optional, Markdown supported)</span>
                  </button>
                  {showGuideEditor && (
                    <div className="mt-2">
                      <textarea
                        value={saveGuide}
                        onChange={(e) => { setSaveGuide(e.target.value); setProfanityWarning(checkProfanity(saveName) || checkProfanity(saveDescription) || checkProfanity(e.target.value)); }}
                        rows={12}
                        placeholder={"# Build Guide\n\n## Overview\nDescribe what this build does and why it works.\n\n## Talent Priority\n1. First pick...\n2. Then...\n\n## Gear Recommendations\n- Helmet: ...\n- Weapon: ...\n\n## Playstyle Tips\n- In PvP, focus on...\n- In dungeons, prioritize..."}
                        className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none resize-y font-mono leading-relaxed ${checkProfanity(saveGuide) ? 'border-scar-red/50 focus:border-scar-red' : 'border-border-subtle focus:border-honor-gold-dim'}`}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-text-muted">Markdown supported: # headings, **bold**, *italic*, - lists, 1. numbered</span>
                        <span className="text-[10px] text-text-muted">{saveGuide.length.toLocaleString()} chars</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold border border-honor-gold/20">Talent Build</span>
                  <span>{gameClass.name}</span>
                  <span className="ml-auto">{totalPts} pts</span>
                </div>
                {profanityWarning && (
                  <div className="bg-scar-red/10 border border-scar-red/30 rounded p-2.5 flex items-start gap-2">
                    <span className="text-scar-red text-sm mt-px">&#9888;</span>
                    <p className="text-xs text-scar-red-light">{profanityWarning} Builds with offensive content will be removed and may result in account restrictions.</p>
                  </div>
                )}
                {cloudError && <p className="text-xs text-scar-red">{cloudError}</p>}
                <button
                  onClick={handleSaveBuild}
                  disabled={saving || !!profanityWarning}
                  className="w-full py-2 bg-honor-gold text-void-black font-heading font-semibold rounded hover:bg-honor-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? 'Saving...' : 'Save Build'}
                </button>
                <button onClick={() => setShowSaveModal(false)} className="w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Load Modal */}
      {!readOnly && showLoadModal && !showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLoadModal(false)}>
          <div className="bg-deep-night border border-border-subtle rounded-lg p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-honor-gold mb-4">Load Build</h3>
            <div className="space-y-3">
              <button
                onClick={() => openBuildBrowser('mine')}
                className="flex items-center gap-3 w-full p-3 bg-dark-surface border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors text-left"
              >
                <span className="text-lg">&#128196;</span>
                <div>
                  <div className="font-heading text-text-primary">My Saved Builds</div>
                  <div className="text-[11px] text-text-muted">Load from your saved builds</div>
                </div>
              </button>
              <button
                onClick={() => openBuildBrowser('all')}
                className="flex items-center gap-3 w-full p-3 bg-dark-surface border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors text-left"
              >
                <span className="text-lg">&#127760;</span>
                <div>
                  <div className="font-heading text-text-primary">Browse All Builds</div>
                  <div className="text-[11px] text-text-muted">Community shared builds</div>
                </div>
              </button>
              <button
                onClick={() => { setShowLoadModal(false); setShowImportModal(true); }}
                className="flex items-center gap-3 w-full p-3 bg-dark-surface border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors text-left"
              >
                <span className="text-lg">&#128274;</span>
                <div>
                  <div className="font-heading text-text-primary">Import via Code</div>
                  <div className="text-[11px] text-text-muted">Paste a build share code</div>
                </div>
              </button>
            </div>
            <button onClick={() => setShowLoadModal(false)} className="mt-4 w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Import Code Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowImportModal(false)}>
          <div className="bg-deep-night border border-border-subtle rounded-lg p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-honor-gold mb-4">Import via Code</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-text-muted block mb-1">Enter Build Code</label>
                <input type="text" value={importCode} onChange={(e) => setImportCode(e.target.value)} maxLength={10} placeholder="e.g. abc123" className="w-full bg-dark-surface border border-border-subtle rounded px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:border-honor-gold-dim" onKeyDown={(e) => { if (e.key === 'Enter') importBuild(); }} /></div>
              {importError && <p className="text-xs text-scar-red">{importError}</p>}
              <button onClick={importBuild} disabled={!importCode.trim()} className="w-full py-2 bg-honor-gold text-void-black font-heading font-semibold rounded hover:bg-honor-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">Load Build</button>
            </div>
            <button onClick={() => { setShowImportModal(false); setImportError(null); setImportCode(''); }} className="mt-4 w-full py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">Back</button>
          </div>
        </div>
      )}

      {showRefundConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRefundConfirm(false)}>
          <div className="bg-deep-night border border-border-subtle rounded-lg p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg text-[#fffede] mb-2">Refund Build?</h3>
            <p className="text-sm text-text-muted mb-5">All {totalPts} allocated point{totalPts === 1 ? '' : 's'} will be reset and your equipment cleared. This can&apos;t be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRefundConfirm(false)}
                className="px-4 py-2 text-xs font-heading uppercase tracking-wider text-text-muted hover:text-[#fffede] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { reset(); setShowRefundConfirm(false); }}
                className="px-4 py-2 text-xs font-heading uppercase tracking-wider text-[#fffede] bg-scar-red/80 hover:bg-scar-red rounded transition-colors"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build Browser Overlay */}
      {showBuildBrowser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBuildBrowser(null)}>
          <div className="bg-deep-night border border-border-subtle rounded-lg w-full max-w-2xl max-h-[70vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex items-center gap-3">
              <h3 className="font-heading text-lg text-honor-gold">
                {showBuildBrowser === 'mine' ? 'My Saved Builds' : 'Browse All Builds'}
              </h3>
              <div className="ml-auto flex items-center gap-2">
                <select
                  value={browserClass}
                  onChange={(e) => {
                    setBrowserClass(e.target.value);
                    setBrowserPage(1);
                    fetchBrowserBuilds(1, e.target.value, showBuildBrowser === 'mine');
                  }}
                  className="bg-dark-surface border border-border-subtle rounded px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-honor-gold-dim"
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                {showBuildBrowser === 'all' && (
                  <select
                    value={browserSort}
                    onChange={(e) => {
                      const s = e.target.value as 'newest' | 'popular';
                      setBrowserSort(s);
                      setBrowserPage(1);
                      fetchBrowserBuilds(1, browserClass, false, s);
                    }}
                    className="bg-dark-surface border border-border-subtle rounded px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-honor-gold-dim"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                )}
                <span className="text-[10px] text-text-muted">{browserTotal} build{browserTotal !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Build List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {browserLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card-bg border border-border-subtle rounded-lg p-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dark-surface" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-dark-surface rounded w-1/3" />
                        <div className="h-3 bg-dark-surface rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : browserBuilds.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-sm">
                  {showBuildBrowser === 'mine' ? 'No saved builds yet.' : 'No builds found.'}
                </div>
              ) : (
                browserBuilds.map((build) => {
                  const cls = classes.find((c) => c.slug === build.classSlug);
                  return (
                    <button
                      key={build.code}
                      onClick={() => loadFromCode(build.code)}
                      className="w-full bg-card-bg border border-border-subtle rounded-lg p-3 hover:border-honor-gold-dim transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        {cls && <img src={cls.icon} alt={cls.name} className="w-9 h-9 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-sm text-text-primary truncate group-hover:text-honor-gold transition-colors">
                              {build.name || 'Unnamed Build'}
                            </span>
                            {build.classSlug !== gameClass.slug && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-scar-red/10 text-scar-red-light border border-scar-red/20 shrink-0">
                                {cls?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted">
                            <span>{build.totalPoints} pts</span>
                            <span>{new Date(build.createdAt).toLocaleDateString()}</span>
                            <span className="font-mono">{build.code}</span>
                            {build.authorName && <span>{build.authorName}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-honor-gold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Load</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer / Pagination */}
            <div className="p-3 border-t border-border-subtle flex items-center justify-end gap-4">
              {browserPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { const p = browserPage - 1; setBrowserPage(p); fetchBrowserBuilds(p, browserClass, showBuildBrowser === 'mine'); }}
                    disabled={browserPage <= 1}
                    className="px-2 py-1 text-xs text-text-muted hover:text-honor-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-[10px] text-text-muted">{browserPage}/{browserPages}</span>
                  <button
                    onClick={() => { const p = browserPage + 1; setBrowserPage(p); fetchBrowserBuilds(p, browserClass, showBuildBrowser === 'mine'); }}
                    disabled={browserPage >= browserPages}
                    className="px-2 py-1 text-xs text-text-muted hover:text-honor-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
              <button onClick={() => setShowBuildBrowser(null)} className="px-3 py-1 text-xs text-text-muted hover:text-text-secondary border border-border-subtle rounded transition-colors">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Class Picker Overlay */}
      {showClassPicker && (
        <div className="fixed top-[109px] left-0 right-0 bottom-0 z-50 bg-black/40" onClick={() => setShowClassPicker(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-deep-night border border-border-subtle rounded-lg p-6 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-xl text-honor-gold mb-5 text-center">Talent Calculator</h3>
            <div className="grid grid-cols-5 gap-4">
              {[...classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls) => (
                <button
                  key={cls.slug}
                  onClick={() => {
                    setShowClassPicker(false);
                    if (cls.slug !== gameClass.slug) talentRouter.push(`/talents/${cls.slug}`);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:border-honor-gold-dim hover:bg-honor-gold/5 ${
                    cls.slug === gameClass.slug
                      ? 'border-honor-gold bg-honor-gold/10'
                      : 'border-border-subtle'
                  }`}
                >
                  <img src={cls.icon} alt={cls.name} className="w-10 h-10" />
                  <span className={`text-xs font-heading ${cls.slug === gameClass.slug ? 'text-honor-gold' : 'text-text-secondary'}`}>
                    {cls.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
