'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  MAPS,
  LAYERS as ALL_LAYERS,
  LAYER_GROUPS as ALL_LAYER_GROUPS,
  LAYER_BY_KEY,
  DEFAULT_LAYER_STATE,
  VISIBLE_LAYER_KEYS,
  type POI,
  type MapDef,
  type LayerGroupId,
} from '@/data/map-config';

// Apply the temporary whitelist: only layers we have real data for show up in
// the sidebar, and groups with no surviving layers disappear entirely.
const LAYERS = ALL_LAYERS.filter((l) => VISIBLE_LAYER_KEYS.has(l.key));
const LAYER_GROUPS = ALL_LAYER_GROUPS.filter((g) =>
  LAYERS.some((l) => l.group === g.id),
);

const MIN_SCALE = 0.5;
const MAX_SCALE = 6;
const ZOOM_STEP = 1.2;

interface ViewState { tx: number; ty: number; scale: number; }

function fitToContainer(map: MapDef, w: number, h: number): ViewState {
  if (!w || !h) return { tx: 0, ty: 0, scale: 1 };
  const scale = Math.min(w / map.width, h / map.height);
  const tx = (w - map.width * scale) / 2;
  const ty = (h - map.height * scale) / 2;
  return { tx, ty, scale };
}

export default function InteractiveMap() {
  const [mapId, setMapId] = useState<string>(MAPS[0].id);
  const [layers, setLayers] = useState<Record<string, boolean>>(DEFAULT_LAYER_STATE);
  const [expandedGroups, setExpandedGroups] = useState<Set<LayerGroupId>>(
    new Set(['locations', 'world', 'playtest', 'interactives']),
  );
  const [view, setView] = useState<ViewState>({ tx: 0, ty: 0, scale: 1 });
  const [hovered, setHovered] = useState<POI | null>(null);
  const [selected, setSelected] = useState<POI | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, tx: 0, ty: 0, moved: false });

  const map = useMemo(() => MAPS.find((m) => m.id === mapId)!, [mapId]);

  // Fit map to container on mount + when map changes
  const fitMap = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setView(fitToContainer(map, rect.width, rect.height));
    setSelected(null);
  }, [map]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Refit whenever the stage resizes (handles initial layout, sidebar toggle, window resize)
    const ro = new ResizeObserver(() => fitMap());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitMap]);

  // Wheel zoom (centered on mouse)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setView((v) => {
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * factor));
        if (newScale === v.scale) return v;
        // Keep the world point under the mouse fixed
        const wx = (mx - v.tx) / v.scale;
        const wy = (my - v.ty) / v.scale;
        return { tx: mx - wx * newScale, ty: my - wy * newScale, scale: newScale };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag pan
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = stageRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = { mx: e.clientX, my: e.clientY, tx: view.tx, ty: view.ty, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragStartRef.current.moved = true;
    setView((v) => ({ ...v, tx: dragStartRef.current.tx + dx, ty: dragStartRef.current.ty + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    stageRef.current?.releasePointerCapture(e.pointerId);
    if (!dragStartRef.current.moved) setSelected(null); // empty click clears selection
  };

  const zoomBy = (factor: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setView((v) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * factor));
      if (newScale === v.scale) return v;
      const wx = (cx - v.tx) / v.scale;
      const wy = (cy - v.ty) / v.scale;
      return { tx: cx - wx * newScale, ty: cy - wy * newScale, scale: newScale };
    });
  };

  const toggleLayer = (key: string) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllInGroup = (groupId: LayerGroupId, on: boolean) => {
    setLayers((prev) => {
      const next = { ...prev };
      for (const l of LAYERS) if (l.group === groupId) next[l.key] = on;
      return next;
    });
  };
  const setAllLayers = (on: boolean) =>
    setLayers(Object.fromEntries(LAYERS.map((l) => [l.key, on])));
  const resetLayers = () => setLayers(DEFAULT_LAYER_STATE);
  const toggleGroup = (id: LayerGroupId) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  // Visible POIs (layer-filtered + search-filtered) sorted so important ones render on top
  const visiblePois = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = map.pois.filter((p) => {
      if (!layers[p.category]) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.blurb && p.blurb.toLowerCase().includes(q));
    });
    // Render order: low priority first (drawn behind), high last (drawn on top)
    const PRIORITY: Record<string, number> = {
      // bulk static placements stay underneath
      fortification: 0, cannon: 0, cookingPot: 0, hauntedTree: 0,
      spawner: 0, questObjective: 1, spawnPoint: 2,
      // interactive markers above bulk
      graveyard: 2, camp: 2,
      battlefield: 3, creaturePlaceholder: 3,
      subZone: 3, settlement: 4,
      region: 5, city: 6, capital: 7,
      // quest givers go on top so they're never hidden behind a settlement
      questGiver: 8,
    };
    return [...filtered].sort((a, b) => (PRIORITY[a.category] ?? 3) - (PRIORITY[b.category] ?? 3));
  }, [map.pois, layers, search]);

  // Counts per layer (for sidebar badges)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of map.pois) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [map.pois]);

  const focusPoi = (p: POI) => {
    setSelected(p);
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const targetScale = Math.max(view.scale, 1.6);
    setView({
      tx: rect.width / 2 - p.x * targetScale,
      ty: rect.height / 2 - p.y * targetScale,
      scale: targetScale,
    });
  };

  return (
    <>
      <style>{`footer { display: none !important; } body { overflow: hidden !important; height: 100vh !important; } main { display: flex !important; min-height: 0 !important; flex: 1 1 auto !important; }`}</style>

      <div className="relative flex flex-1 w-full bg-void-black text-text-primary text-base-reset">
        {/* SIDEBAR */}
        <aside
          className={`${sidebarOpen ? 'w-[320px]' : 'w-0'} shrink-0 transition-[width] duration-200 overflow-hidden border-r border-border-subtle/40 bg-deep-night flex flex-col`}
        >
          <div className="px-4 py-4 border-b border-border-subtle/40">
            <h1 className="font-heading text-honor-gold text-xl mb-1">Atlas of Aragon</h1>
            <p className="text-[11px] text-text-muted leading-snug">
              In-game zone maps datamined from the playtest client. POIs added as datamined coords are confirmed.
            </p>
          </div>

          {/* Map switcher */}
          <div className="px-4 py-3 border-b border-border-subtle/40">
            <label className="block text-[10px] uppercase tracking-[0.18em] text-text-muted mb-2">Map</label>
            <select
              value={mapId}
              onChange={(e) => setMapId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-dark-surface text-sm border border-border-subtle/40 focus:border-honor-gold-dim focus:outline-none text-text-primary"
            >
              {MAPS.map((m) => (
                <option key={m.id} value={m.id} className="bg-dark-surface">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-border-subtle/40">
            <input
              type="search"
              placeholder="Search POIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-dark-surface text-sm border border-border-subtle/40 focus:border-honor-gold-dim focus:outline-none placeholder:text-text-muted/60"
            />
          </div>

          {/* Master layer controls */}
          <div className="px-4 py-2 border-b border-border-subtle/40 flex items-center gap-2 text-[11px]">
            <span className="text-text-muted uppercase tracking-[0.16em]">All Layers</span>
            <button
              onClick={() => setAllLayers(false)}
              className="ml-auto px-2 py-0.5 rounded bg-dark-surface text-text-muted hover:text-honor-gold transition-colors"
              title="Hide every layer"
            >
              Hide All
            </button>
            <button
              onClick={resetLayers}
              className="px-2 py-0.5 rounded bg-dark-surface text-text-muted hover:text-honor-gold transition-colors"
              title="Restore defaults"
            >
              Reset
            </button>
          </div>

          {/* Layer groups */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {LAYER_GROUPS.map((g) => {
              const groupLayers = LAYERS.filter((l) => l.group === g.id);
              if (!groupLayers.length) return null;
              const visibleCount = groupLayers.reduce(
                (n, l) => n + (counts[l.key] || 0), 0,
              );
              const isExpanded = expandedGroups.has(g.id);
              return (
                <div key={g.id} className="mb-1">
                  <div className="flex items-center justify-between px-2 py-1.5 group">
                    <button
                      onClick={() => toggleGroup(g.id)}
                      className="flex items-center gap-2 flex-1 text-left text-[11px] uppercase tracking-[0.16em] text-text-muted hover:text-honor-gold transition-colors"
                    >
                      <span className={`inline-block w-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                      <span>{g.title}</span>
                      {visibleCount > 0 && (
                        <span className="text-[10px] text-text-muted/60">({visibleCount})</span>
                      )}
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setAllInGroup(g.id, true)}
                        className="text-[9px] text-text-muted hover:text-honor-gold px-1"
                        title="Show all"
                      >ON</button>
                      <button
                        onClick={() => setAllInGroup(g.id, false)}
                        className="text-[9px] text-text-muted hover:text-honor-gold px-1"
                        title="Hide all"
                      >OFF</button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="ml-4">
                      {groupLayers.map((l) => {
                        const count = counts[l.key] || 0;
                        const isOn = layers[l.key];
                        return (
                          <button
                            key={l.key}
                            onClick={() => toggleLayer(l.key)}
                            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-dark-surface/50 transition-colors ${
                              isOn ? 'text-text-primary' : 'text-text-muted/50'
                            }`}
                          >
                            <span
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 text-[9px] font-bold flex-shrink-0"
                              style={{
                                borderColor: isOn ? l.color : '#3a3a44',
                                backgroundColor: isOn ? `${l.color}33` : 'transparent',
                                color: isOn ? l.color : '#3a3a44',
                              }}
                            >
                              {l.glyph || ''}
                            </span>
                            <span className="flex-1 text-left text-[13px]">{l.label}</span>
                            {count > 0 && (
                              <span className="text-[10px] text-text-muted/60">{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Search results list */}
            {search && (
              <div className="mt-3 pt-3 border-t border-border-subtle/40">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-2 px-2">
                  Results ({visiblePois.length})
                </p>
                {visiblePois.slice(0, 20).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => focusPoi(p)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-dark-surface/50 transition-colors text-left"
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: LAYER_BY_KEY[p.category]?.color || '#fff' }}
                    />
                    <span className="flex-1 truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border-subtle/40 text-[10px] text-text-muted leading-snug">
            ScarsHQ Atlas (work in progress) · {map.pois.length} POIs on this map
          </div>
        </aside>

        {/* Sidebar collapse handle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute top-3 z-10 px-1.5 py-3 bg-dark-surface/90 hover:bg-honor-gold/10 border border-border-subtle/40 rounded-r text-text-muted hover:text-honor-gold transition-colors"
          style={{ left: sidebarOpen ? 320 : 0 }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>

        {/* MAP STAGE */}
        <div
          ref={stageRef}
          className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, #1c2030, #0e1018)',
          }}
        >
          {/* Transformed surface */}
          <div
            style={{
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
              transformOrigin: '0 0',
              width: map.width,
              height: map.height,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {/* Map image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={map.image}
              alt={map.label}
              draggable={false}
              width={map.width}
              height={map.height}
              style={{ width: map.width, height: map.height, display: 'block', userSelect: 'none', pointerEvents: 'none' }}
            />

            {/* POI markers */}
            <svg
              width={map.width}
              height={map.height}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
            >
              {/* Region + sub-zone polygon overlays (drawn behind markers) */}
              {map.polygons.map((poly) => {
                if (!layers[poly.category]) return null;
                const isHovered = hovered?.id === poly.id;
                const isSelected = selected?.id === poly.id;
                const layer = LAYER_BY_KEY[poly.category];
                const baseColor = layer?.color || '#9d7a3a';
                const pointsAttr = poly.points.map(([x, y]) => `${x},${y}`).join(' ');
                const isProminent = poly.category === 'region';
                return (
                  <polygon
                    key={`poly-${poly.id}`}
                    points={pointsAttr}
                    fill={baseColor}
                    fillOpacity={
                      isHovered || isSelected
                        ? (isProminent ? 0.28 : 0.18)
                        : (isProminent ? 0.12 : 0.04)
                    }
                    stroke={baseColor}
                    strokeOpacity={
                      isHovered || isSelected
                        ? 0.95
                        : (isProminent ? 0.55 : 0.32)
                    }
                    strokeWidth={
                      (isSelected ? 3 : isProminent ? 2 : 1) / Math.max(view.scale, 0.6)
                    }
                    strokeDasharray={isProminent ? undefined : '4 4'}
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })}
              {visiblePois.map((p) => {
                const layer = LAYER_BY_KEY[p.category];
                if (!layer) return null;
                const isLabel = p.category.endsWith('Label');
                const isHovered = hovered?.id === p.id;
                const isSelected = selected?.id === p.id;
                if (isLabel) {
                  return (
                    <g
                      key={p.id}
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                      onPointerEnter={() => setHovered(p)}
                      onPointerLeave={() => setHovered(null)}
                    >
                      <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        fontFamily="var(--font-cinzel), serif"
                        fontSize={26 / Math.max(view.scale, 0.6)}
                        fontWeight="bold"
                        fill={layer.color}
                        stroke="#000"
                        strokeWidth={3 / Math.max(view.scale, 0.6)}
                        paintOrder="stroke fill"
                        opacity={0.95}
                      >
                        {p.name}
                      </text>
                    </g>
                  );
                }
                // Per-category size weighting — bigger for important POIs, tiny for clusters
                const sizeMul =
                  p.category === 'capital' ? 1.5 :
                  p.category === 'city' ? 1.25 :
                  p.category === 'region' ? 1.2 :
                  p.category === 'settlement' ? 1.0 :
                  p.category === 'subZone' ? 0.85 :
                  p.category === 'questObjective' ? 0.55 :
                  p.category === 'spawner' ? 0.5 :
                  p.category === 'spawnPoint' ? 0.7 :
                  // datamined interactive props — small dots
                  p.category === 'fortification' ? 0.45 :
                  p.category === 'cannon' ? 0.5 :
                  p.category === 'cookingPot' ? 0.5 :
                  p.category === 'hauntedTree' ? 0.5 :
                  p.category === 'camp' ? 0.7 :
                  p.category === 'graveyard' ? 0.7 :
                  p.category === 'battlefield' ? 0.75 :
                  p.category === 'creaturePlaceholder' ? 0.8 :
                  // manually placed chests — make them clearly visible
                  p.category === 'rareChest' ? 1.1 :
                  p.category === 'fantasticChest' ? 1.2 :
                  p.category === 'mythicalChest' ? 1.3 :
                  1.0;
                const r = (isHovered || isSelected ? 9 : 7) * sizeMul / Math.max(view.scale * 0.6, 0.4);
                return (
                  <g
                    key={p.id}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                    onPointerEnter={() => setHovered(p)}
                    onPointerLeave={() => setHovered(null)}
                    transform={`translate(${p.x} ${p.y})`}
                  >
                    <circle r={r + 2 / Math.max(view.scale, 0.6)} fill="#000" opacity="0.55" />
                    <circle
                      r={r}
                      fill={layer.color}
                      stroke={isSelected ? '#fff' : '#1c1c22'}
                      strokeWidth={(isSelected ? 2.5 : 1.5) / Math.max(view.scale, 0.6)}
                    />
                    {layer.glyph && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={r * 1.05}
                        fontWeight="bold"
                        fill="#1c1c22"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {layer.glyph}
                      </text>
                    )}
                    {/* Persistent label for important POIs (regions, cities, capitals) */}
                    {(p.category === 'region' || p.category === 'capital' || p.category === 'city') && (
                      <text
                        y={-r - 6 / Math.max(view.scale, 0.6)}
                        textAnchor="middle"
                        fontFamily="var(--font-cinzel), serif"
                        fontSize={(p.category === 'region' ? 18 : 14) / Math.max(view.scale, 0.6)}
                        fontWeight="bold"
                        fill={layer.color}
                        stroke="#000"
                        strokeWidth={2.5 / Math.max(view.scale, 0.6)}
                        paintOrder="stroke fill"
                        opacity={0.92}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {p.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Top-right controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
            <button
              onClick={() => zoomBy(ZOOM_STEP)}
              className="w-9 h-9 bg-dark-surface/90 hover:bg-honor-gold/10 border border-border-subtle/40 rounded text-honor-gold text-lg leading-none"
              title="Zoom in"
            >+</button>
            <button
              onClick={() => zoomBy(1 / ZOOM_STEP)}
              className="w-9 h-9 bg-dark-surface/90 hover:bg-honor-gold/10 border border-border-subtle/40 rounded text-honor-gold text-lg leading-none"
              title="Zoom out"
            >−</button>
            <button
              onClick={fitMap}
              className="w-9 h-9 bg-dark-surface/90 hover:bg-honor-gold/10 border border-border-subtle/40 rounded text-honor-gold text-xs"
              title="Fit map"
            >⊡</button>
          </div>

          {/* Bottom-left zoom indicator */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-dark-surface/85 border border-border-subtle/40 rounded text-[11px] text-text-muted">
            {Math.round(view.scale * 100)}% · {visiblePois.length}/{map.pois.length} POIs
          </div>

          {/* Hover tooltip */}
          {hovered && hovered !== selected && (
            <div
              className="pointer-events-none absolute z-20 px-2.5 py-1.5 bg-deep-night/95 border border-honor-gold-dim/50 rounded text-xs whitespace-nowrap shadow-lg"
              style={{
                left: hovered.x * view.scale + view.tx + 12,
                top: hovered.y * view.scale + view.ty + 12,
                transform: 'translateZ(0)',
              }}
            >
              <span style={{ color: LAYER_BY_KEY[hovered.category]?.color }} className="font-medium">{hovered.name}</span>
              <span className="text-text-muted ml-2 text-[10px]">{LAYER_BY_KEY[hovered.category]?.label}</span>
            </div>
          )}

          {/* Selection panel */}
          {selected && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[420px] max-w-[calc(100vw-2rem)] bg-deep-night/95 border border-honor-gold-dim/50 rounded-lg shadow-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-text-muted mb-1">
                    {LAYER_BY_KEY[selected.category]?.label || selected.category}
                  </div>
                  <h2 className="font-heading text-honor-gold text-lg leading-tight">{selected.name}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-text-muted hover:text-honor-gold text-lg leading-none px-1"
                  title="Close"
                >×</button>
              </div>
              {selected.continent && (
                <p className="text-[11px] text-text-muted mb-1">Continent: {selected.continent}</p>
              )}
              {selected.blurb && (
                <p className="text-sm text-text-secondary leading-6 mt-2">{selected.blurb}</p>
              )}
              {selected.questSlug && (
                <a
                  href={`/database/quests/${selected.questSlug}`}
                  className="inline-block mt-3 text-sm text-honor-gold hover:text-honor-gold-light"
                >
                  View {selected.questTitle || 'quest'} →
                </a>
              )}
              {selected.source && (
                <p className="text-[10px] text-text-muted mt-3 italic">Source: {selected.source}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
