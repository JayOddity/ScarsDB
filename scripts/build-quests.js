#!/usr/bin/env node
/**
 * Reads datamined quest_resolution.json and emits public/data/playtest-quests.json
 * for the /database/quests pages.
 *
 * Source:  E:/Website Stuff/Datamining/output/quest_resolution.json
 * Output:  wip/public/data/playtest-quests.json
 *
 * Re-run after datamine refresh:
 *   node scripts/build-quests.js
 */

const fs = require('node:fs');
const path = require('node:path');

const DATAMINE_SRC =
  process.env.QUEST_RESOLUTION_PATH ||
  'E:/Website Stuff/Datamining/output/quest_resolution.json';
const OUT_PATH = path.join(process.cwd(), 'public', 'data', 'playtest-quests.json');

const TYPE_LABELS = {
  1: 'Main',
  2: 'Side',
  8: 'Special',
};

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function buildSlugs(quests) {
  const seen = new Map();
  for (const q of quests) {
    const base = slugify(q.title) || `quest-${q.id}`;
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    q.slug = n === 0 ? base : `${base}-${n + 1}`;
  }
}

function main() {
  if (!fs.existsSync(DATAMINE_SRC)) {
    console.error(`[build-quests] source not found: ${DATAMINE_SRC}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(DATAMINE_SRC, 'utf8'));
  const srcQuests = raw.quests || {};
  const srcTargets = raw.targets || {};

  const targetsByQuest = new Map();
  for (const [tid, t] of Object.entries(srcTargets)) {
    const qid = t.questId;
    if (!qid) continue;
    if (!targetsByQuest.has(qid)) targetsByQuest.set(qid, []);
    targetsByQuest.get(qid).push({
      id: Number(tid),
      titleId: t.titleId,
      type: t.type,
      text: t.objectiveText || '',
      data: t.data,
      fdata: t.fdata,
    });
  }
  for (const arr of targetsByQuest.values()) {
    arr.sort((a, b) => a.id - b.id);
  }

  const quests = [];
  for (const [qid, q] of Object.entries(srcQuests)) {
    const id = Number(qid);
    const objectives = (targetsByQuest.get(id) || [])
      .filter((o) => o.text && o.text.trim().length > 0)
      .map((o) => ({
        type: o.type,
        text: o.text,
        coords: hasCoords(o.fdata) ? [o.fdata[0], o.fdata[1], o.fdata[2]] : null,
        radius: o.fdata && o.fdata[3] ? o.fdata[3] : null,
        counter: o.data && o.data[1] && o.type === 1 ? o.data[1] : null,
      }));
    quests.push({
      id,
      title: q.title || `Quest ${id}`,
      type: q.type,
      typeLabel: TYPE_LABELS[q.type] || 'Other',
      objectives,
      slug: '', // filled by buildSlugs
    });
  }

  quests.sort((a, b) => {
    if (a.type !== b.type) return a.type - b.type;
    return a.title.localeCompare(b.title);
  });

  buildSlugs(quests);

  const types = [...new Set(quests.map((q) => q.typeLabel))];

  const out = {
    generatedAt: new Date().toISOString(),
    source: 'datamine/quest_resolution.json',
    total: quests.length,
    types,
    quests,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

  console.log(`[build-quests] ${quests.length} quests written to ${OUT_PATH}`);
  console.log(`[build-quests] types: ${types.join(', ')}`);
  const sample = quests[0];
  if (sample) {
    console.log(`[build-quests] sample: "${sample.title}" (${sample.typeLabel}) — ${sample.objectives.length} objectives`);
  }
}

function hasCoords(fdata) {
  if (!Array.isArray(fdata) || fdata.length < 3) return false;
  return fdata[0] !== 0 || fdata[1] !== 0 || fdata[2] !== 0;
}

main();
