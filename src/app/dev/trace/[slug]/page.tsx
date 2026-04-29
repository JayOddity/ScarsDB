'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

const DEFAULT_SCALE = 1.8;

type Mode = 'add' | 'move' | 'image' | 'connect' | 'chain';
type Marker = { id: number; x: number; y: number; label?: string };

interface JsonNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: 'start' | 'minor' | 'major' | 'keystone' | 'active';
  name: string;
}

const COLORS: Record<string, string> = {
  start: '#22cccc',
  minor: '#d9d9d9',
  major: '#e8c432',
  keystone: '#e8c432',
  active: '#ff6f3c',
};

export default function TracePage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug || 'paladin').toLowerCase();
  const className = slug.charAt(0).toUpperCase() + slug.slice(1);
  const [overlayUrl, setOverlayUrl] = useState(`/dev/${slug}-overlay.png`);
  const jsonUrl = `/data/talents/${slug}.json`;
  const lsKey = `scarshq-${slug}-trace`;

  const [imgW, setImgW] = useState(2218);
  const [imgH, setImgH] = useState(1239);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [nodes, setNodes] = useState<JsonNode[]>([]);
  const [, setEdges] = useState<{ from: number; to: number }[]>([]);
  const [showExisting, setShowExisting] = useState(true);
  const [showEdges, setShowEdges] = useState(false);
  const [imgOpacity, setImgOpacity] = useState(0.85);
  const [hubX, setHubX] = useState(0);
  const [hubY, setHubY] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [mode, setMode] = useState<Mode>('add');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<number | null>(null);
  const [editedNodes, setEditedNodes] = useState<Record<number, { dx: number; dy: number }>>({});
  const [userEdges, setUserEdges] = useState<{ from: number; to: number }[]>([]);
  const [connectFromId, setConnectFromId] = useState<number | null>(null);
  const [camera, setCamera] = useState({ cx: 0, cy: 0, zoom: 0.6 });
  const [panning, setPanning] = useState(false);
  const [draggingImage, setDraggingImage] = useState(false);
  const imgDragRef = useRef({ sx: 0, sy: 0, hubX: 0, hubY: 0 });
  const panRef = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const historyRef = useRef<{ markers: Marker[]; editedNodes: Record<number, { dx: number; dy: number }>; userEdges: { from: number; to: number }[] }[]>([]);
  const [, forceHistoryRender] = useState(0);
  const markersRef = useRef<Marker[]>([]);
  const editedNodesRef = useRef<Record<number, { dx: number; dy: number }>>({});
  const userEdgesRef = useRef<{ from: number; to: number }[]>([]);
  markersRef.current = markers;
  editedNodesRef.current = editedNodes;
  userEdgesRef.current = userEdges;

  const snapshot = useCallback(() => {
    historyRef.current.push({ markers: markersRef.current, editedNodes: editedNodesRef.current, userEdges: userEdgesRef.current });
    if (historyRef.current.length > 100) historyRef.current.shift();
    forceHistoryRender((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    const last = historyRef.current.pop();
    if (!last) return;
    setMarkers(last.markers);
    setEditedNodes(last.editedNodes);
    setUserEdges(last.userEdges);
    forceHistoryRender((n) => n + 1);
  }, []);

  // Probe png/jpg/jpeg/webp for the overlay, take the first that loads.
  useEffect(() => {
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    let cancelled = false;
    (async () => {
      for (const ext of exts) {
        const url = `/dev/${slug}-overlay.${ext}`;
        const ok = await new Promise<boolean>((resolve) => {
          const probe = new window.Image();
          probe.onload = () => {
            if (cancelled) return resolve(false);
            setImgW(probe.naturalWidth);
            setImgH(probe.naturalHeight);
            setHubX((prev) => prev || Math.round(probe.naturalWidth / 2));
            setHubY((prev) => prev || Math.round(probe.naturalHeight / 2));
            setOverlayUrl(url);
            setImgLoaded(true);
            resolve(true);
          };
          probe.onerror = () => resolve(false);
          probe.src = url;
        });
        if (ok || cancelled) return;
      }
      if (!cancelled) setImgLoaded(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Restore from localStorage (per-class key)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.hubX === 'number') setHubX(s.hubX);
        if (typeof s.hubY === 'number') setHubY(s.hubY);
        if (typeof s.scale === 'number') setScale(s.scale);
        if (Array.isArray(s.markers)) setMarkers(s.markers);
        if (s.editedNodes) setEditedNodes(s.editedNodes);
        if (Array.isArray(s.userEdges)) setUserEdges(s.userEdges);
      } else {
        setMarkers([]); setEditedNodes({}); setUserEdges([]);
      }
    } catch { /* ignore */ }
  }, [lsKey]);

  useEffect(() => {
    try {
      localStorage.setItem(lsKey, JSON.stringify({ hubX, hubY, scale, markers, editedNodes, userEdges }));
    } catch { /* ignore */ }
  }, [lsKey, hubX, hubY, scale, markers, editedNodes, userEdges]);

  // Load existing class JSON
  useEffect(() => {
    fetch(jsonUrl).then((r) => r.json()).then((data) => {
      setNodes(data.nodes || []);
      setEdges(data.connections || []);
    }).catch(() => { /* ignore */ });
  }, [jsonUrl]);

  const VB_W = 4000;
  const VB_H = 3000;
  const vbW = VB_W / camera.zoom;
  const vbH = VB_H / camera.zoom;
  const vbX = camera.cx - vbW / 2;
  const vbY = camera.cy - vbH / 2;
  const viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const imgWorldX = -hubX * scale;
  const imgWorldY = -hubY * scale;
  const imgWorldW = imgW * scale;
  const imgWorldH = imgH * scale;

  function svgPointFromEvent(e: React.MouseEvent | MouseEvent | WheelEvent): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = (e as MouseEvent).clientX;
    pt.y = (e as MouseEvent).clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const inv = ctm.inverse();
    const p = pt.matrixTransform(inv);
    return { x: p.x, y: p.y };
  }

  function getNodePos(id: number): { dx: number; dy: number } | null {
    if (id <= 6) {
      const sn = nodes.find((n) => n.id === id);
      if (!sn) return null;
      return editedNodes[sn.id] || { dx: sn.dx, dy: sn.dy };
    }
    const m = markers[id - 7];
    if (!m) return null;
    return { dx: m.x, dy: m.y };
  }

  function handleConnectClick(nodeId: number) {
    if (connectFromId === null) { setConnectFromId(nodeId); return; }
    if (connectFromId === nodeId) { setConnectFromId(null); return; }
    const exists = userEdges.some((e) =>
      (e.from === connectFromId && e.to === nodeId) || (e.from === nodeId && e.to === connectFromId)
    );
    if (!exists) {
      snapshot();
      setUserEdges((prev) => [...prev, { from: connectFromId, to: nodeId }]);
      console.log(`edge ${connectFromId} -> ${nodeId}`);
    }
    setConnectFromId(nodeId);
  }

  function removeEdge(idx: number) {
    snapshot();
    setUserEdges((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleClick(e: React.MouseEvent) {
    if (panRef.current && (panRef.current as { moved?: boolean }).moved) {
      (panRef.current as { moved?: boolean }).moved = false;
      return;
    }
    if (mode === 'image') return;
    if (mode === 'connect') return;
    const p = svgPointFromEvent(e);
    if (!p) return;
    const wx = Math.round(p.x);
    const wy = Math.round(p.y);
    if (mode === 'chain') {
      if (connectFromId === null) return;
      const newNodeId = markers.length + 7;
      snapshot();
      setMarkers((m) => [...m, { id: Date.now(), x: wx, y: wy }]);
      setUserEdges((prev) => [...prev, { from: connectFromId, to: newNodeId }]);
      setConnectFromId(newNodeId);
      console.log(`chain marker ${newNodeId} { x: ${wx}, y: ${wy} }`);
      return;
    }
    if (mode === 'add') {
      snapshot();
      setMarkers((m) => [...m, { id: Date.now(), x: wx, y: wy }]);
      console.log(`marker { x: ${wx}, y: ${wy} }`);
    } else if (mode === 'move' && selectedExisting !== null) {
      snapshot();
      setEditedNodes((prev) => ({ ...prev, [selectedExisting]: { dx: wx, dy: wy } }));
      console.log(`moved node ${selectedExisting} -> { dx: ${wx}, dy: ${wy} }`);
    }
  }

  function startPan(e: React.MouseEvent) {
    if (mode === 'image' && e.button === 0 && !e.shiftKey) {
      e.preventDefault();
      const p = svgPointFromEvent(e);
      if (!p) return;
      setDraggingImage(true);
      imgDragRef.current = { sx: p.x, sy: p.y, hubX, hubY };
      return;
    }
    if (e.altKey && e.button === 0) {
      e.preventDefault();
      const p = svgPointFromEvent(e);
      if (!p) return;
      setDraggingImage(true);
      imgDragRef.current = { sx: p.x, sy: p.y, hubX, hubY };
      return;
    }
    if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return;
    e.preventDefault();
    setPanning(true);
    panRef.current = { mx: e.clientX, my: e.clientY, cx: camera.cx, cy: camera.cy };
    (panRef.current as { moved?: boolean }).moved = false;
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!panning) return;
      const dx = (e.clientX - panRef.current.mx) / camera.zoom;
      const dy = (e.clientY - panRef.current.my) / camera.zoom;
      if (Math.abs(dx) + Math.abs(dy) > 2) (panRef.current as { moved?: boolean }).moved = true;
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      const scaleX = VB_W / camera.zoom / r.width;
      const scaleY = VB_H / camera.zoom / r.height;
      setCamera((c) => ({ ...c, cx: panRef.current.cx - (e.clientX - panRef.current.mx) * scaleX, cy: panRef.current.cy - (e.clientY - panRef.current.my) * scaleY }));
    }
    function onUp() { setPanning(false); }
    if (panning) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [panning, camera.zoom]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingImage) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = pt.matrixTransform(ctm.inverse());
      const dxWorld = p.x - imgDragRef.current.sx;
      const dyWorld = p.y - imgDragRef.current.sy;
      setHubX(Math.round(imgDragRef.current.hubX - dxWorld / scale));
      setHubY(Math.round(imgDragRef.current.hubY - dyWorld / scale));
    }
    function onUp() { setDraggingImage(false); }
    if (draggingImage) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingImage, scale]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const p = svgPointFromEvent(e.nativeEvent);
    if (!p) return;
    const factor = e.deltaY > 0 ? 0.85 : 1.18;
    const newZoom = Math.max(0.1, Math.min(8, camera.zoom * factor));
    const k = camera.zoom / newZoom;
    setCamera({
      cx: p.x + (camera.cx - p.x) * k,
      cy: p.y + (camera.cy - p.y) * k,
      zoom: newZoom,
    });
  }

  function exportData() {
    const updatedNodes = nodes.map((n) => editedNodes[n.id] ? { ...n, ...editedNodes[n.id] } : n);
    const out = {
      slug,
      hubX, hubY, scale,
      newMarkers: markers.map((m) => ({ x: m.x, y: m.y })),
      editedNodes,
      userEdges,
      updatedNodes,
    };
    const txt = JSON.stringify(out, null, 2);
    navigator.clipboard.writeText(txt);
    console.log(out);
    alert(`Copied to clipboard:\n- ${markers.length} new markers\n- ${userEdges.length} edges\n- ${Object.keys(editedNodes).length} edited nodes\n- offset (${hubX}, ${hubY}) scale ${scale}`);
  }

  function fitImage() {
    setCamera({ cx: 0, cy: 0, zoom: Math.min(VB_W / imgWorldW, VB_H / imgWorldH) * 0.95 });
  }

  function clearAll() {
    if (!confirm('Clear markers, edges, and edits?')) return;
    snapshot();
    setMarkers([]);
    setEditedNodes({});
    setUserEdges([]);
    setConnectFromId(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { undo(); e.preventDefault(); return; }
      if (e.key === 'Escape') { setConnectFromId(null); e.preventDefault(); return; }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { setHubX((x) => x + step); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setHubX((x) => x - step); e.preventDefault(); }
      if (e.key === 'ArrowUp') { setHubY((y) => y + step); e.preventDefault(); }
      if (e.key === 'ArrowDown') { setHubY((y) => y + step); e.preventDefault(); }
      if (e.key === '=' || e.key === '+') { setScale((s) => +(s + 0.01).toFixed(3)); e.preventDefault(); }
      if (e.key === '-' || e.key === '_') { setScale((s) => +(s - 0.01).toFixed(3)); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const block = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', block, { passive: false });
    return () => el.removeEventListener('wheel', block);
  }, []);

  return (
    <div className="fixed inset-0 flex bg-[#0d0d0d] text-white">
      <div ref={containerRef} className="flex-1 relative overflow-hidden" onMouseDown={startPan}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full select-none"
          style={{ cursor: draggingImage ? 'grabbing' : panning ? 'grabbing' : mode === 'image' ? 'move' : mode === 'add' ? 'crosshair' : 'default' }}
          onClick={handleClick}
          onWheel={handleWheel}
        >
          <image
            href={overlayUrl}
            x={imgWorldX}
            y={imgWorldY}
            width={imgWorldW}
            height={imgWorldH}
            opacity={imgOpacity}
            preserveAspectRatio="none"
            pointerEvents="none"
          />

          <line x1={-50} y1={0} x2={50} y2={0} stroke="#00ff00" strokeWidth={1.5 / camera.zoom} />
          <line x1={0} y1={-50} x2={0} y2={50} stroke="#00ff00" strokeWidth={1.5 / camera.zoom} />
          <circle cx={0} cy={0} r={4 / camera.zoom} fill="#00ff00" />

          {(showEdges ? userEdges : userEdges).map((edge, i) => {
            const a = getNodePos(edge.from);
            const b = getNodePos(edge.to);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.dx} y1={a.dy} x2={b.dx} y2={b.dy}
                stroke="#86d8af"
                strokeWidth={3 / camera.zoom}
                opacity={0.85}
                style={{ cursor: mode === 'connect' ? 'pointer' : 'default' }}
                onClick={(e) => {
                  if (mode !== 'connect') return;
                  e.stopPropagation();
                  removeEdge(i);
                }}
              />
            );
          })}

          {showExisting && nodes.filter((n) => n.nodeType === 'start').map((n) => {
            const p = editedNodes[n.id] || { dx: n.dx, dy: n.dy };
            const isSel = selectedExisting === n.id;
            const isEdited = !!editedNodes[n.id];
            const isConnectSrc = connectFromId === n.id;
            const r = 18;
            return (
              <g
                key={n.id}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (mode === 'connect' || mode === 'chain') { handleConnectClick(n.id); return; }
                  if (mode === 'move') {
                    setSelectedExisting(n.id);
                    console.log(`selected node ${n.id} (${n.nodeType}) at (${p.dx}, ${p.dy})`);
                  }
                }}
              >
                <circle
                  cx={p.dx}
                  cy={p.dy}
                  r={r}
                  fill="none"
                  stroke={isConnectSrc ? '#ffaa00' : isSel ? '#00ff00' : isEdited ? '#ff00ff' : COLORS[n.nodeType] || '#888'}
                  strokeWidth={(isConnectSrc ? 4 : isSel ? 3 : 2) / camera.zoom}
                />
                <circle cx={p.dx} cy={p.dy} r={r * 0.25} fill={isConnectSrc ? '#ffaa00' : isSel ? '#00ff00' : isEdited ? '#ff00ff' : COLORS[n.nodeType] || '#888'} />
                <text x={p.dx} y={p.dy - r - 4 / camera.zoom} fontSize={11 / camera.zoom} textAnchor="middle" fill="#fff" pointerEvents="none">{n.id}</text>
              </g>
            );
          })}

          {markers.map((m, i) => {
            const id = i + 7;
            const isConnectSrc = connectFromId === id;
            return (
              <g
                key={m.id}
                style={{ cursor: mode === 'connect' || mode === 'chain' ? 'pointer' : 'default' }}
                onClick={(e) => {
                  if (mode !== 'connect' && mode !== 'chain') return;
                  e.stopPropagation();
                  handleConnectClick(id);
                }}
              >
                <circle cx={m.x} cy={m.y} r={18} fill={mode === 'connect' || mode === 'chain' ? 'rgba(0,0,0,0.01)' : 'none'} stroke={isConnectSrc ? '#ffaa00' : '#00ff88'} strokeWidth={(isConnectSrc ? 4 : 2) / camera.zoom} />
                <circle cx={m.x} cy={m.y} r={4.5} fill={isConnectSrc ? '#ffaa00' : '#00ff88'} />
                <text x={m.x + 22} y={m.y + 5} fontSize={11 / camera.zoom} fill={isConnectSrc ? '#ffaa00' : '#00ff88'} pointerEvents="none">{id}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-80 bg-[#12122a] border-l border-white/10 px-4 pt-12 pb-4 overflow-y-auto text-sm">
        <h1 className="text-base font-bold mb-2">{className} Trace (DEV)</h1>
        {!imgLoaded && (
          <p className="text-xs text-amber-300 mb-3">
            Overlay not found at <code className="text-[10px]">public{overlayUrl}</code>. Drop the screenshot there and reload.
          </p>
        )}
        <p className="text-xs text-gray-400 mb-4">
          Click on canvas to drop a marker. Shift+drag or middle-click to pan. Wheel to zoom.
          Arrow keys nudge image (Shift = ×10), +/− tweaks scale.
        </p>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={() => setMode('add')} className={`px-3 py-1.5 rounded text-xs ${mode === 'add' ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20'}`}>Add</button>
            <button onClick={() => setMode('move')} className={`px-3 py-1.5 rounded text-xs ${mode === 'move' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'}`}>Move</button>
            <button onClick={() => setMode('image')} className={`px-3 py-1.5 rounded text-xs ${mode === 'image' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}>Image</button>
            <button onClick={() => { setMode('connect'); setConnectFromId(null); }} className={`px-3 py-1.5 rounded text-xs ${mode === 'connect' ? 'bg-amber-500' : 'bg-white/10 hover:bg-white/20'}`}>Connect</button>
            <button onClick={() => { setMode('chain'); setConnectFromId(null); }} className={`col-span-2 px-3 py-1.5 rounded text-xs ${mode === 'chain' ? 'bg-pink-600' : 'bg-white/10 hover:bg-white/20'}`}>Add + Connect (chain)</button>
          </div>
          {mode === 'image' && <p className="text-xs text-blue-300">Drag the canvas to move the image. (Tip: hold Alt + drag in any mode to move the image.)</p>}
          {mode === 'connect' && (
            <p className="text-xs text-amber-300">
              Click a node, then click another node to draw a line between them. Keeps chaining from the last node — Esc or re-click to stop. Click an existing line to delete it.
              {connectFromId !== null && <span className="block text-amber-200">from: node {connectFromId}</span>}
            </p>
          )}
          {mode === 'chain' && (
            <p className="text-xs text-pink-300">
              Click a starting node, then click anywhere to drop a new marker AND link it. Each new marker becomes the next anchor. Re-click the active node or press Esc to stop.
              {connectFromId !== null && <span className="block text-pink-200">from: node {connectFromId}</span>}
            </p>
          )}
          {mode === 'move' && (
            <p className="text-xs text-gray-400">
              Click an existing dot to select it, then click on the canvas to move it.
              {selectedExisting !== null && <span className="block text-purple-300">selected: node {selectedExisting}</span>}
            </p>
          )}
          <button onClick={() => setShowExisting((v) => !v)} className="w-full mt-2 px-3 py-1.5 rounded text-xs bg-white/10 hover:bg-white/20 border border-white/10">{showExisting ? 'Hide existing dots (ping mode)' : 'Show existing dots'}</button>
        </div>

        <fieldset className="mb-4 border border-white/10 rounded p-2">
          <legend className="px-1 text-xs text-gray-400">Image align</legend>
          <label className="block text-xs mb-2">Hub px X: <input type="number" value={hubX} onChange={(e) => setHubX(Number(e.target.value))} className="w-20 bg-black/40 px-1 ml-1" /></label>
          <label className="block text-xs mb-2">Hub px Y: <input type="number" value={hubY} onChange={(e) => setHubY(Number(e.target.value))} className="w-20 bg-black/40 px-1 ml-1" /></label>
          <label className="block text-xs mb-2">Scale: <input type="number" step="0.01" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-20 bg-black/40 px-1 ml-1" /></label>
          <label className="block text-xs">Image opacity: <input type="range" min={0} max={1} step={0.05} value={imgOpacity} onChange={(e) => setImgOpacity(Number(e.target.value))} className="w-full" /></label>
          <p className="text-[10px] text-gray-500 mt-1">Image: {imgW}×{imgH} px</p>
        </fieldset>

        <fieldset className="mb-4 border border-white/10 rounded p-2">
          <legend className="px-1 text-xs text-gray-400">Overlays</legend>
          <label className="block text-xs mb-1"><input type="checkbox" checked={showExisting} onChange={(e) => setShowExisting(e.target.checked)} /> Show existing nodes</label>
          <label className="block text-xs"><input type="checkbox" checked={showEdges} onChange={(e) => setShowEdges(e.target.checked)} /> Show edges</label>
        </fieldset>

        <div className="mb-4 flex gap-2">
          <button onClick={fitImage} className="flex-1 px-3 py-1.5 rounded text-xs bg-white/10 hover:bg-white/20">Fit image</button>
          <button onClick={() => setCamera({ cx: 0, cy: 0, zoom: 1 })} className="flex-1 px-3 py-1.5 rounded text-xs bg-white/10 hover:bg-white/20">Reset zoom</button>
        </div>

        <div className="mb-4 text-xs text-gray-300">
          <p>Markers: <span className="font-mono">{markers.length}</span></p>
          <p>Edges: <span className="font-mono">{userEdges.length}</span></p>
          <p>Edited: <span className="font-mono">{Object.keys(editedNodes).length}</span></p>
        </div>

        <div className="flex gap-2 mb-2">
          <button onClick={undo} disabled={historyRef.current.length === 0} className="flex-1 px-3 py-1.5 rounded text-xs bg-blue-600/30 border border-blue-400/40 hover:bg-blue-600/50 disabled:opacity-40 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">↶ Undo {historyRef.current.length > 0 ? `(${historyRef.current.length})` : ''}</button>
          <button onClick={clearAll} className="px-3 py-1.5 rounded text-xs bg-red-700/40 border border-red-500/40 hover:bg-red-700/60">Clear</button>
        </div>
        <button onClick={exportData} className="w-full mb-2 px-3 py-1.5 rounded text-xs bg-honor-gold/20 border border-honor-gold/40 text-honor-gold hover:bg-honor-gold/30">Copy JSON</button>

        {markers.length > 0 && (
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-gray-400">Markers ({markers.length})</summary>
            <ul className="mt-2 max-h-60 overflow-y-auto font-mono text-[10px]">
              {markers.map((m, i) => (
                <li key={m.id} className="flex justify-between py-0.5 border-b border-white/5">
                  <span>{i + 1}: ({m.x}, {m.y})</span>
                  <button onClick={() => { snapshot(); setMarkers((arr) => arr.filter((x) => x.id !== m.id)); }} className="text-red-400 hover:text-red-300">×</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
