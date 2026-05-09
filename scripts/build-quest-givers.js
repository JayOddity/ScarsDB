#!/usr/bin/env node
/**
 * Builds map-pois/world-quest-givers.json from existing world.json POIs +
 * quest_resolution.json. For every positioned questObjective POI whose target
 * type is 8 ("speak/meet/deliver-to"), emit a new POI under category
 * "questGiver" titled with the NPC name extracted from the objective text.
 *
 * Re-run after datamine refresh:
 *   node scripts/build-quest-givers.js
 */

const fs = require('node:fs');
const path = require('node:path');

const WORLD_POIS = path.join(process.cwd(), 'src/data/map-pois/world.json');
const QUEST_RES =
  process.env.QUEST_RESOLUTION_PATH ||
  'E:/Website Stuff/Datamining/output/quest_resolution.json';
const QUEST_JSON = path.join(process.cwd(), 'public/data/playtest-quests.json');
const OUT = path.join(process.cwd(), 'src/data/map-pois/world-quest-givers.json');

const VERBS = '(?:Meet|Talk\\s+to|Speak\\s+(?:with|to)|Debrief(?:\\s+with)?|Return\\s+to|Enquire(?:\\s+(?:to|about))?|Interrogate|Visit|Report\\s+to)';

function extractNpc(text) {
  if (!text) return null;
  let s = text.trim();

  // Two-step pattern: "Return to <Place> and <Verb> with <NPC>" -> NPC
  // (Otherwise the leading verb captures the place, not the person.)
  const twoStep = new RegExp(`\\band\\s+${VERBS}\\s+(?:the\\s+)?(.+)$`, 'i');
  const tm = s.match(twoStep);
  if (tm) return tidy(stripTrailingLocation(tm[1]));

  // Drop trailing "in / at / back at / about / around / near / on <Location...>"
  s = stripTrailingLocation(s);

  // "Deliver/Present/Bring/Hand over/Give/Take X to Y" -> Y
  let m = s.match(/(?:Deliver|Present|Hand\s+over|Bring|Give|Take)\s+.+?\s+to\s+(?:the\s+)?(.+)$/i);
  if (m) return tidy(m[1]);

  // "Enquire about X to Y" -> Y
  m = s.match(/Enquire\s+about\s+.+?\s+to\s+(?:the\s+)?(.+)$/i);
  if (m) return tidy(m[1]);

  // Single verb: "Meet|Talk to|...|Interrogate X"
  m = s.match(new RegExp(`^\\s*${VERBS}\\s+(?:the\\s+)?(.+)$`, 'i'));
  if (m) return tidy(m[1]);

  return null;
}

function stripTrailingLocation(s) {
  return s.replace(
    /\s+(?:back\s+)?(?:in|at|about|around|near|on)\s+(?:the\s+)?[A-Z][^.]*$/,
    '',
  );
}

function tidy(name) {
  return name
    .replace(/[.,;:!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function main() {
  const worldRaw = JSON.parse(fs.readFileSync(WORLD_POIS, 'utf8'));
  const qres = JSON.parse(fs.readFileSync(QUEST_RES, 'utf8'));
  const questsBundle = fs.existsSync(QUEST_JSON)
    ? JSON.parse(fs.readFileSync(QUEST_JSON, 'utf8'))
    : { quests: [] };
  const slugByQid = new Map(questsBundle.quests.map((q) => [q.id, q.slug]));

  const targets = qres.targets || {};
  const type8 = new Set(
    Object.entries(targets)
      .filter(([, t]) => t.type === 8)
      .map(([tid]) => tid),
  );

  // Group positioned questObjectives by extracted NPC name + quest, so we
  // collapse duplicates ("Talk to Advisor Fjorna" appears multiple times).
  const givers = new Map();

  for (const p of worldRaw.pois) {
    if (p.category !== 'questObjective') continue;
    const m = /questTargetId=(\d+)/.exec(p.source || '');
    if (!m) continue;
    const tid = m[1];
    if (!type8.has(tid)) continue;
    const t = targets[tid];
    const npc = extractNpc(t.objectiveText);
    if (!npc) continue;

    const questTitle = p.name; // questObjectives are titled by quest name
    const questId = t.questId;
    const slug = slugByQid.get(questId);

    // Dedupe by approximate spot + quest. NPCs referenced as both "Advisor
    // Deepriver" and "Advisor Fjorna Deepriver" land at near-identical coords;
    // rounding to integers absorbs sub-pixel drift between sibling steps.
    const spotKey = `${Math.round(p.x)}|${Math.round(p.y)}|${questId}`;
    const existing = givers.get(spotKey);
    if (existing) {
      existing.steps.push(t.objectiveText);
      if (npc.length > existing.name.length && npc.toLowerCase().includes(existing.name.split(' ').pop().toLowerCase())) {
        existing.name = npc; // upgrade to the more specific name
      }
      continue;
    }
    givers.set(spotKey, {
      id: `quest-giver-${slugify(npc)}-${questId}-${Math.round(p.x)}-${Math.round(p.y)}`,
      category: 'questGiver',
      name: npc,
      x: p.x,
      y: p.y,
      questId,
      questTitle,
      questSlug: slug,
      steps: [t.objectiveText],
    });
  }

  // Final POI shape (compact + map-friendly)
  const pois = [...givers.values()].map((g) => ({
    id: g.id,
    category: 'questGiver',
    name: g.name,
    x: g.x,
    y: g.y,
    blurb: `${g.questTitle}: ${g.steps.join(' / ')}`,
    questSlug: g.questSlug || null,
    questTitle: g.questTitle,
  }));

  pois.sort((a, b) => a.name.localeCompare(b.name));

  const out = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'world.json + datamine/quest_resolution.json',
      total: pois.length,
    },
    pois,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');

  const distinctNpcs = new Set(pois.map((p) => p.name));
  console.log(`[build-quest-givers] ${pois.length} pins covering ${distinctNpcs.size} distinct NPCs`);
  console.log(`[build-quest-givers] wrote ${OUT}`);
  console.log(`[build-quest-givers] sample NPCs: ${[...distinctNpcs].slice(0, 6).join(', ')}`);
}

main();
