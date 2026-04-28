#!/usr/bin/env node
/**
 * Generate talent tree layouts as branching constellations.
 *
 * Each class has 6 starting nodes around a central hub. From each starting
 * node, a "petal" grows outward as a tree: a spine of 6-9 nodes with side
 * branches that can sub-fork once and terminate in active nodes, major
 * nodes, diamonds, or small triangle clusters. Per-class variation comes
 * from seed + a chosen recipe of 6 petal profiles. Connections are strictly
 * parent->child so the graph reads like a constellation rather than a hairball.
 *
 * Outputs to public/data/talents/{slug}.json.
 */

const fs = require('fs');
const path = require('path');

function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

class Builder {
  constructor(seed) {
    this.rng = mulberry32(seed);
    this.nodes = [];
    this.edges = [];
    this.seenEdge = new Set();
    this.nextId = 1;
  }

  addNode(x, y, type, maxRank = 3) {
    const id = this.nextId++;
    this.nodes.push({
      id,
      dx: Math.round(x),
      dy: Math.round(y),
      nodeType: type,
      name: `Node ${id}`,
      description: '',
      maxRank: type === 'start' || type === 'active' ? 1 : maxRank,
    });
    return id;
  }

  connect(a, b) {
    if (a === b) return;
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (this.seenEdge.has(k)) return;
    this.seenEdge.add(k);
    this.edges.push({ from: a, to: b });
  }

  minDistTo(x, y) {
    let m = Infinity;
    for (const n of this.nodes) {
      const dx = n.dx - x, dy = n.dy - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < m) m = d2;
    }
    return Math.sqrt(m);
  }

  pos(id) { return this.nodes[id - 1]; }
}

const MIN_SPACING = 80;

function stepFrom(b, parentId, angle, length, type, maxRank) {
  const p = b.pos(parentId);
  let x = p.dx + Math.cos(angle) * length;
  let y = p.dy + Math.sin(angle) * length;
  let tries = 0;
  while (b.minDistTo(x, y) < MIN_SPACING && tries < 8) {
    const bump = 25 + tries * 18;
    const perp = angle + Math.PI / 2;
    const dir = b.rng() < 0.5 ? 1 : -1;
    x = p.dx + Math.cos(angle) * length + Math.cos(perp) * bump * dir;
    y = p.dy + Math.sin(angle) * length + Math.sin(perp) * bump * dir;
    tries++;
  }
  const id = b.addNode(x, y, type, maxRank);
  b.connect(parentId, id);
  return id;
}

function growChain(b, parentId, angle, count, segLen, wobble = 0.18) {
  const ids = [];
  let prev = parentId;
  let dir = angle;
  for (let i = 0; i < count; i++) {
    dir += (b.rng() - 0.5) * wobble;
    const len = segLen * (0.85 + b.rng() * 0.3);
    const id = stepFrom(b, prev, dir, len, 'minor', 3);
    ids.push(id);
    prev = id;
  }
  return { ids, dir };
}

// Terminal cluster shapes
function growTerminal(b, parentId, angle, kind) {
  if (kind === 'active') {
    return [stepFrom(b, parentId, angle, 115, 'active', 1)];
  }
  if (kind === 'major') {
    return [stepFrom(b, parentId, angle, 105, 'major', 3)];
  }
  if (kind === 'diamond') {
    // diamond = 4 nodes around a major capstone
    const tip = stepFrom(b, parentId, angle, 130, 'major', 3);
    const tp = b.pos(tip);
    const r = 95;
    const a1 = angle - Math.PI / 2;
    const a2 = angle + Math.PI / 2;
    const a = b.addNode(tp.dx + Math.cos(a1) * r, tp.dy + Math.sin(a1) * r, 'minor', 3);
    const c = b.addNode(tp.dx + Math.cos(a2) * r, tp.dy + Math.sin(a2) * r, 'minor', 3);
    const d = b.addNode(tp.dx + Math.cos(angle) * r * 1.4, tp.dy + Math.sin(angle) * r * 1.4, 'active', 1);
    b.connect(tip, a); b.connect(tip, c); b.connect(a, d); b.connect(c, d);
    return [tip, a, c, d];
  }
  if (kind === 'triangle') {
    const tip = stepFrom(b, parentId, angle, 120, 'minor', 3);
    const tp = b.pos(tip);
    const r = 95;
    const a1 = angle + Math.PI / 2.5;
    const a2 = angle - Math.PI / 2.5;
    const a = b.addNode(tp.dx + Math.cos(a1) * r, tp.dy + Math.sin(a1) * r, 'minor', 3);
    const c = b.addNode(tp.dx + Math.cos(a2) * r, tp.dy + Math.sin(a2) * r, 'major', 3);
    b.connect(tip, a); b.connect(tip, c); b.connect(a, c);
    return [tip, a, c];
  }
  if (kind === 'crown') {
    // 5-node arc fanning forward
    const tip = stepFrom(b, parentId, angle, 110, 'major', 3);
    const tp = b.pos(tip);
    const r = 100;
    const ids = [tip];
    let prev = tip;
    for (let k = 0; k < 4; k++) {
      const a = angle + (k - 1.5) * 0.55;
      const id = b.addNode(tp.dx + Math.cos(a) * r, tp.dy + Math.sin(a) * r, k === 1 || k === 2 ? 'active' : 'minor', k === 1 || k === 2 ? 1 : 3);
      b.connect(prev, id);
      prev = id;
      ids.push(id);
    }
    return ids;
  }
  // small fork — 2 minors splaying outward
  const a = stepFrom(b, parentId, angle - 0.4, 110, 'minor', 3);
  const c = stepFrom(b, parentId, angle + 0.4, 110, 'minor', 3);
  return [a, c];
}

// One petal: spine + 1st-order branches + 2nd-order sub-branches.
function growPetal(b, rootId, baseAngle, profile) {
  const { spineLen, segLen, branches, tip } = profile;
  const spine = [];
  let prev = rootId;
  let dir = baseAngle;
  for (let i = 0; i < spineLen; i++) {
    dir += (b.rng() - 0.5) * 0.1;
    const len = segLen * (0.95 + b.rng() * 0.15);
    const isMid = i === Math.floor(spineLen / 2);
    const isEnd = i === spineLen - 1;
    const type = isMid && !isEnd ? 'major' : 'minor';
    const id = stepFrom(b, prev, dir, len, type, 3);
    spine.push(id);
    prev = id;
  }
  for (const br of branches) {
    const idx = Math.min(spine.length - 1, Math.max(0, br.at));
    const anchor = spine[idx];
    const branchAngle = baseAngle + br.angle;
    const { ids: chain, dir: chainDir } = growChain(b, anchor, branchAngle, br.len, segLen * 0.95, 0.22);
    const last = chain.length ? chain[chain.length - 1] : anchor;
    if (br.terminal) growTerminal(b, last, chainDir, br.terminal);
    // optional sub-branch
    if (br.subAt !== undefined && chain.length > br.subAt) {
      const subAnchor = chain[br.subAt];
      const subAngle = chainDir + (br.subAngle ?? (br.angle > 0 ? -0.7 : 0.7));
      const { ids: sub, dir: subDir } = growChain(b, subAnchor, subAngle, br.subLen ?? 3, segLen * 0.9, 0.2);
      const subLast = sub.length ? sub[sub.length - 1] : subAnchor;
      if (br.subTerminal) growTerminal(b, subLast, subDir, br.subTerminal);
    }
  }
  growTerminal(b, spine[spine.length - 1], dir, tip);
  return spine;
}

// 6 distinct petal profiles for melee classes (paladin family).
const MELEE_PROFILES = [
  { spineLen: 7, segLen: 130, tip: 'active',
    branches: [
      { at: 1, angle: -0.9, len: 4, terminal: 'major', subAt: 1, subAngle: -0.7, subLen: 2, subTerminal: 'major' },
      { at: 3, angle: 0.85, len: 4, terminal: 'diamond' },
      { at: 5, angle: -0.6, len: 3, terminal: 'major' },
    ] },
  { spineLen: 8, segLen: 125, tip: 'crown',
    branches: [
      { at: 2, angle: 0.9, len: 3, terminal: 'triangle' },
      { at: 4, angle: -0.85, len: 5, terminal: 'major', subAt: 2, subAngle: 0.7, subLen: 2, subTerminal: 'major' },
      { at: 6, angle: 0.5, len: 2, terminal: null },
    ] },
  { spineLen: 6, segLen: 140, tip: 'diamond',
    branches: [
      { at: 1, angle: -0.7, len: 4, terminal: 'triangle' },
      { at: 2, angle: 0.75, len: 3, terminal: 'active' },
      { at: 4, angle: -0.55, len: 4, terminal: 'major', subAt: 1, subAngle: 0.6, subLen: 2, subTerminal: null },
    ] },
  { spineLen: 7, segLen: 130, tip: 'major',
    branches: [
      { at: 1, angle: 0.95, len: 5, terminal: 'major', subAt: 2, subAngle: -0.65, subLen: 3, subTerminal: 'active' },
      { at: 3, angle: -0.9, len: 4, terminal: 'diamond' },
      { at: 5, angle: 0.6, len: 3, terminal: 'major' },
    ] },
  { spineLen: 8, segLen: 125, tip: 'active',
    branches: [
      { at: 2, angle: -0.8, len: 4, terminal: 'major' },
      { at: 4, angle: 0.85, len: 5, terminal: 'crown' },
      { at: 6, angle: -0.55, len: 3, terminal: 'major' },
    ] },
  { spineLen: 7, segLen: 130, tip: 'triangle',
    branches: [
      { at: 1, angle: 0.85, len: 3, terminal: 'major' },
      { at: 3, angle: -0.9, len: 4, terminal: 'major', subAt: 2, subAngle: 0.7, subLen: 3, subTerminal: 'active' },
      { at: 5, angle: 0.6, len: 4, terminal: 'diamond' },
    ] },
];

// 6 distinct petal profiles for caster classes (mage family) — slightly looser/longer arms.
const CASTER_PROFILES = [
  { spineLen: 8, segLen: 135, tip: 'active',
    branches: [
      { at: 2, angle: 0.95, len: 4, terminal: 'major', subAt: 2, subAngle: -0.6, subLen: 2, subTerminal: 'major' },
      { at: 4, angle: -0.9, len: 5, terminal: 'diamond' },
      { at: 6, angle: 0.55, len: 3, terminal: 'major' },
    ] },
  { spineLen: 9, segLen: 125, tip: 'crown',
    branches: [
      { at: 1, angle: -0.85, len: 4, terminal: 'triangle' },
      { at: 4, angle: 0.9, len: 5, terminal: 'major', subAt: 2, subAngle: -0.7, subLen: 3, subTerminal: 'active' },
      { at: 7, angle: -0.6, len: 3, terminal: 'major' },
    ] },
  { spineLen: 7, segLen: 140, tip: 'diamond',
    branches: [
      { at: 1, angle: 0.9, len: 4, terminal: 'triangle' },
      { at: 3, angle: -0.85, len: 5, terminal: 'major', subAt: 2, subAngle: 0.65, subLen: 2, subTerminal: 'major' },
      { at: 5, angle: 0.6, len: 3, terminal: 'active' },
    ] },
  { spineLen: 8, segLen: 130, tip: 'major',
    branches: [
      { at: 2, angle: -0.95, len: 5, terminal: 'crown' },
      { at: 4, angle: 0.85, len: 4, terminal: 'diamond' },
      { at: 6, angle: -0.55, len: 3, terminal: 'major' },
    ] },
  { spineLen: 9, segLen: 125, tip: 'active',
    branches: [
      { at: 1, angle: 0.85, len: 3, terminal: 'major' },
      { at: 4, angle: -0.9, len: 5, terminal: 'major', subAt: 3, subAngle: 0.7, subLen: 3, subTerminal: 'active' },
      { at: 6, angle: 0.55, len: 4, terminal: 'triangle' },
    ] },
  { spineLen: 7, segLen: 135, tip: 'triangle',
    branches: [
      { at: 1, angle: -0.85, len: 4, terminal: 'diamond' },
      { at: 3, angle: 0.9, len: 5, terminal: 'major', subAt: 2, subAngle: -0.7, subLen: 3, subTerminal: 'active' },
      { at: 5, angle: -0.55, len: 3, terminal: 'major' },
    ] },
];

// Each class gets its own ordering of the 6 profiles around the hub
function shuffleProfiles(profiles, seed) {
  const arr = profiles.slice();
  const rng = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Paladin: hand-tuned to match the official screenshot. ---
// Each of the 6 petals is defined explicitly so they read as distinct
// constellations (diamond at top-right, long reaching arm at right, bushy
// fan at bottom-left, etc.) rather than 6 copies of the same recipe.
//
// Petals are described as a list of "arms": each arm is a chain of N nodes
// from the start node along an angle, with optional side-shoots and a
// terminal. Multiple arms per start = the fan-from-hub look in the screenshot.

function growArm(b, parentId, angle, count, segLen, wobble = 0.18) {
  const ids = [];
  let prev = parentId;
  let dir = angle;
  for (let i = 0; i < count; i++) {
    dir += (b.rng() - 0.5) * wobble;
    const len = segLen * (0.9 + b.rng() * 0.2);
    const id = stepFrom(b, prev, dir, len, 'minor', 3);
    ids.push(id);
    prev = id;
  }
  return { ids, dir };
}

function buildPetalArms(b, rootId, baseAngle, recipe) {
  const { arms, segLen = 130 } = recipe;
  for (const arm of arms) {
    const armAngle = baseAngle + (arm.angle ?? 0);
    const { ids: chain, dir: armDir } = growArm(b, rootId, armAngle, arm.len, segLen, arm.wobble ?? 0.16);
    // promote interior major node if requested
    if (arm.majorAt !== undefined && chain[arm.majorAt]) {
      const n = b.pos(chain[arm.majorAt]);
      n.nodeType = 'major';
    }
    // side shoots off this arm
    if (arm.shoots) {
      for (const sh of arm.shoots) {
        const anchor = chain[Math.min(chain.length - 1, sh.at)];
        const shAngle = armDir + sh.angle;
        const { ids: subChain, dir: subDir } = growArm(b, anchor, shAngle, sh.len, segLen * 0.95, 0.2);
        const last = subChain.length ? subChain[subChain.length - 1] : anchor;
        if (sh.terminal) growTerminal(b, last, subDir, sh.terminal);
      }
    }
    const tipId = chain.length ? chain[chain.length - 1] : rootId;
    if (arm.terminal) growTerminal(b, tipId, armDir, arm.terminal);
  }
}

// 6 petals at 60° intervals, traced from the official Paladin screenshot.
// The screenshot shows DRAMATIC per-petal asymmetry: bottom-left fans wide
// and dense, right is a long thin arm with an active terminal, top-right is
// short but has a clean diamond cluster. We mirror that here.
//
// Petal order: 0=top, 1=top-right, 2=right, 3=bottom, 4=bottom-left, 5=top-left
//   (note: 4 corresponds to the SW sector at 8 o'clock — the densest one)
//
// Each petal lists its arms. shoots[] sit on the arm; sub[] sit on the shoot.
const PALADIN_PETALS = [
  // ── Petal 0: TOP (12 o'clock) — tall vertical spine with side fans ─────
  {
    arms: [
      { angle: 0, len: 5, majorAt: 2, terminal: 'triangle', wobble: 0.08,
        shoots: [
          { at: 1, angle: -0.8, len: 3, terminal: 'major' },
          { at: 2, angle: 0.85, len: 3, terminal: 'major' },
          { at: 3, angle: -0.7, len: 2, terminal: null },
          { at: 4, angle: 0.6, len: 2, terminal: 'major' },
        ] },
    ],
  },

  // ── Petal 1: TOP-RIGHT (2 o'clock) — single arm into the diamond ──────
  {
    arms: [
      { angle: 0.1, len: 4, majorAt: 1, terminal: 'diamond', wobble: 0.1,
        shoots: [
          { at: 1, angle: -0.7, len: 2, terminal: 'major' },
        ] },
      { angle: -0.55, len: 3, terminal: 'major' },
    ],
  },

  // ── Petal 2: RIGHT (4 o'clock) — the LONG eastern arm, active capstone ─
  // Matches the green allocation path in the screenshot.
  {
    arms: [
      { angle: -0.05, len: 8, majorAt: 3, terminal: 'active', wobble: 0.08,
        shoots: [
          { at: 1, angle: -0.55, len: 3, terminal: 'major' },
          { at: 4, angle: 0.6, len: 4, terminal: 'major' },
          { at: 6, angle: -0.5, len: 2, terminal: 'triangle' },
        ] },
    ],
  },

  // ── Petal 3: BOTTOM (6 o'clock) — vertical spine with dual side branches
  {
    arms: [
      { angle: 0, len: 5, majorAt: 2, terminal: 'major', wobble: 0.08,
        shoots: [
          { at: 1, angle: -0.85, len: 3, terminal: 'triangle' },
          { at: 2, angle: 0.85, len: 4, terminal: 'major' },
          { at: 3, angle: -0.5, len: 2, terminal: null },
        ] },
      { angle: 0.55, len: 3, terminal: 'major' },
    ],
  },

  // ── Petal 4: BOTTOM-LEFT (8 o'clock) — THE BIG ONE: 3 fanning arms,
  //    multiple terminal clusters, sub-shoots. Densest petal in the screenshot.
  {
    arms: [
      // upper arm fanning into a triangle and a major
      { angle: -0.55, len: 5, majorAt: 2, terminal: 'major',
        shoots: [
          { at: 2, angle: -0.7, len: 3, terminal: 'triangle' },
          { at: 4, angle: 0.55, len: 2, terminal: 'major' },
        ] },
      // middle arm — longest, runs out into a crown
      { angle: 0, len: 7, majorAt: 3, terminal: 'crown',
        shoots: [
          { at: 1, angle: -0.8, len: 3, terminal: 'major' },
          { at: 3, angle: 0.7, len: 4, terminal: 'major' },
          { at: 5, angle: -0.55, len: 3, terminal: 'triangle' },
        ] },
      // lower arm — curls back south, ends in diamond
      { angle: 0.55, len: 6, majorAt: 2, terminal: 'diamond',
        shoots: [
          { at: 1, angle: 0.7, len: 3, terminal: 'major' },
          { at: 3, angle: -0.55, len: 2, terminal: null },
        ] },
    ],
  },

  // ── Petal 5: TOP-LEFT (10 o'clock) — curved sweep with terminal cluster
  {
    arms: [
      { angle: 0.05, len: 6, majorAt: 2, terminal: 'major', wobble: 0.2,
        shoots: [
          { at: 1, angle: 0.85, len: 3, terminal: 'major' },
          { at: 3, angle: -0.75, len: 4, terminal: 'triangle' },
          { at: 5, angle: 0.55, len: 3, terminal: 'active' },
        ] },
      { angle: -0.55, len: 4, terminal: 'major',
        shoots: [{ at: 2, angle: -0.6, len: 2, terminal: null }] },
    ],
  },
];

function buildPaladin(cfg) {
  const b = new Builder(cfg.seed);

  // Inner hexagon of 6 starting nodes, pulled in close to the hub.
  const startR = 240;
  const startIds = [];
  for (let i = 0; i < 6; i++) {
    const a = (TAU * i) / 6 - Math.PI / 2;
    startIds.push(b.addNode(Math.cos(a) * startR, Math.sin(a) * startR, 'start', 1));
  }
  for (let i = 0; i < 6; i++) b.connect(startIds[i], startIds[(i + 1) % 6]);

  // Per-petal segLen — tighter or looser to vary how far each petal reaches.
  // Index matches PALADIN_PETALS:
  //   0=top, 1=top-right, 2=right (long), 3=bottom, 4=bottom-left (dense), 5=top-left
  const petalSegLens = [120, 115, 135, 120, 125, 125];

  for (let i = 0; i < 6; i++) {
    const baseAngle = (TAU * i) / 6 - Math.PI / 2;
    buildPetalArms(b, startIds[i], baseAngle, { ...PALADIN_PETALS[i], segLen: petalSegLens[i] });
  }

  return {
    class: cfg.name,
    accentColor: cfg.accentColor,
    center: { x: 0, y: 0 },
    nodes: b.nodes,
    connections: b.edges,
  };
}

function buildClass(cfg) {
  // All classes use the hand-tuned Paladin layout (same seed for identical
  // topology) until real per-class talent data lands. Only the accent colour
  // and class name vary per output.
  return buildPaladin({ ...cfg, seed: 1002 });
}

const CLASSES = [
  { slug: 'warrior',     name: 'Warrior',     accentColor: '#d4a44e', seed: 1001, template: 'melee' },
  { slug: 'paladin',     name: 'Paladin',     accentColor: '#e8c432', seed: 1002, template: 'melee' },
  { slug: 'ranger',      name: 'Ranger',      accentColor: '#7ac74c', seed: 1003, template: 'melee' },
  { slug: 'assassin',    name: 'Assassin',    accentColor: '#8c2a3a', seed: 1004, template: 'melee' },
  { slug: 'pirate',      name: 'Pirate',      accentColor: '#ff8c42', seed: 1005, template: 'melee' },
  { slug: 'mage',        name: 'Mage',        accentColor: '#6ea8ff', seed: 2001, template: 'caster' },
  { slug: 'priest',      name: 'Priest',      accentColor: '#e0e8f0', seed: 2002, template: 'caster' },
  { slug: 'druid',       name: 'Druid',       accentColor: '#4a8f4a', seed: 2003, template: 'caster' },
  { slug: 'necromancer', name: 'Necromancer', accentColor: '#9a4dab', seed: 2004, template: 'caster' },
  { slug: 'mystic',      name: 'Mystic',      accentColor: '#7a5cd6', seed: 2005, template: 'caster' },
];

const outDir = path.join(__dirname, '..', 'public', 'data', 'talents');
fs.mkdirSync(outDir, { recursive: true });

for (const cfg of CLASSES) {
  const data = buildClass(cfg);
  const file = path.join(outDir, `${cfg.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(`Wrote ${cfg.slug}.json — ${data.nodes.length} nodes, ${data.connections.length} connections`);
}
