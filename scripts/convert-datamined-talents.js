#!/usr/bin/env node
/**
 * Converts a datamined talent tree JSON (from E:\Website Stuff\Datamining\)
 * into the format expected by src/components/TalentTree.tsx.
 *
 * Usage: node scripts/convert-datamined-talents.js [class]
 *   defaults to 'ranger'
 *
 * Datamined fields per node: id, talentId, groupId, group, position{x,y},
 * spriteName, spriteNameAcquired, nameKey, descKey, frame, frameId,
 * requiredIds[], name, description.
 *
 * Component fields per node: id, dx, dy, nodeType, name, description,
 * maxRank, iconUrl?
 *
 * Frame  → nodeType:
 *   Greater       → start (only when group=Root; else 'major' for Greater non-root)
 *   Major         → minor
 *   MajorLarge    → major
 *   Active        → active
 *
 * Connections: for each node with requiredIds, emit { from: req, to: node.id }.
 * Position scale: divided by SCALE so the auto-fit camera lands on a usable
 * zoom level (component does zoom = 4000 / (maxX-minX+400)).
 */
const fs = require('node:fs');
const path = require('node:path');

const SRC_ROOT = 'E:\\Website Stuff\\Datamining\\output\\talents_calculator';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data', 'talents');
const ICON_SRC = path.join(SRC_ROOT, 'icons');
const ICON_DST = path.join(__dirname, '..', 'public', 'Icons', 'Talents', 'abilities');
const ICON_URL_PREFIX = '/Icons/Talents/abilities';

const SCALE = 1 / 3;

const ACCENT = {
  ranger: '#7ac74c',
  paladin: '#d4af37',
  druid: '#3aa17e',
  mage: '#5b9bd5',
};

function nodeType(frame, group) {
  if (group === 'Root') return 'start';
  if (frame === 'Active') return 'active';
  if (frame === 'MajorLarge') return 'major';
  if (frame === 'Greater') return 'major';
  return 'minor';
}

function convert(cls) {
  const srcPath = path.join(SRC_ROOT, `${cls}.json`);
  if (!fs.existsSync(srcPath)) throw new Error(`Datamined source not found: ${srcPath}`);
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

  fs.mkdirSync(ICON_DST, { recursive: true });
  const copiedIcons = new Set();

  const nodes = src.nodes.map((n) => {
    let iconUrl = null;
    const sprite = n.spriteName || n.spriteNameAcquired;
    if (sprite) {
      const srcIcon = path.join(ICON_SRC, `${sprite}.png`);
      if (fs.existsSync(srcIcon)) {
        const dst = path.join(ICON_DST, `${sprite}.png`);
        if (!fs.existsSync(dst)) fs.copyFileSync(srcIcon, dst);
        copiedIcons.add(sprite);
        iconUrl = `${ICON_URL_PREFIX}/${encodeURIComponent(sprite)}.png`;
      }
    }
    return {
      id: n.id,
      dx: Math.round(n.position.x * SCALE),
      dy: Math.round(n.position.y * SCALE),
      nodeType: nodeType(n.frame, n.group),
      name: n.name || `Talent ${n.id}`,
      description: (n.description || '').replace(/^"+|"+$/g, ''),
      maxRank: 1,
      iconUrl,
    };
  });

  const connections = [];
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const n of src.nodes) {
    for (const req of n.requiredIds || []) {
      if (nodeIds.has(req)) connections.push({ from: req, to: n.id });
    }
  }

  // Drop orphans: any node not reachable from a start via the prereq graph.
  // The playtest data has a handful of disabled/WIP placeholder talents floating
  // in dead space — they're not selectable, so they shouldn't render.
  const adj = new Map();
  for (const id of nodeIds) adj.set(id, new Set());
  for (const c of connections) {
    adj.get(c.from).add(c.to);
    adj.get(c.to).add(c.from);
  }
  const starts = nodes.filter((n) => n.nodeType === 'start').map((n) => n.id);
  const reachable = new Set();
  const stack = [...starts];
  while (stack.length) {
    const id = stack.pop();
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const next of adj.get(id) || []) stack.push(next);
  }
  const droppedIds = [...nodeIds].filter((id) => !reachable.has(id));
  if (droppedIds.length) {
    console.log(`  dropped ${droppedIds.length} orphan node(s): ${droppedIds.join(', ')}`);
  }
  const keptNodes = nodes.filter((n) => reachable.has(n.id));
  const keptConnections = connections.filter((c) => reachable.has(c.from) && reachable.has(c.to));

  const out = {
    class: cls.charAt(0).toUpperCase() + cls.slice(1),
    accentColor: ACCENT[cls] || '#c8a84e',
    center: { x: 0, y: 0 },
    nodes: keptNodes,
    connections: keptConnections,
  };

  const outPath = path.join(OUT_DIR, `${cls}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out));

  const counts = keptNodes.reduce((m, n) => ({ ...m, [n.nodeType]: (m[n.nodeType] || 0) + 1 }), {});
  console.log(`${cls}: wrote ${keptNodes.length} nodes, ${keptConnections.length} connections → ${outPath}`);
  console.log(`  nodeTypes:`, counts);
  console.log(`  icons copied: ${copiedIcons.size}`);
}

const cls = (process.argv[2] || 'ranger').toLowerCase();
convert(cls);
