// Compare every Sanity item against the playtest client's localized item table.
// Reports which BeastBurst items also exist in the datamined Items_en.txt
// (i.e. are reachable in the current playtest client) and which aren't.
//
// Read-only — does NOT write to Sanity. Outputs a report to tmp/.
//
// Usage:
//   node scripts/match-playtest-items.js

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const SHARED_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items Shared Data/Items Shared Data.txt';
const EN_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items_en/Items_en.txt';
const REPORT_PATH = path.join(__dirname, '..', 'tmp', 'playtest-match-report.json');
const REPORT_MD = path.join(__dirname, '..', 'tmp', 'playtest-match-report.md');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function parseSharedKeyToId(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Map();
  const re = /SharedTableEntry data[\s\S]*?m_Id\s*=\s*(-?\d+)[\s\S]*?m_Key\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) out.set(m[2], m[1]);
  return out;
}
function parseEnIdToLocalized(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Map();
  const re = /TableEntryData data[\s\S]*?m_Id\s*=\s*(-?\d+)[\s\S]*?m_Localized\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) out.set(m[1], m[2]);
  return out;
}

function looksLikeKey(name) {
  return typeof name === 'string' && /Key$/.test(name) && !/\s/.test(name);
}

// Normalize for matching: lowercase, drop apostrophes/punct, collapse whitespace.
function norm(s) {
  if (typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/['‘’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

(async () => {
  console.log('Parsing datamine localization tables...');
  const keyToId = parseSharedKeyToId(SHARED_PATH);
  const idToLocal = parseEnIdToLocalized(EN_PATH);

  // Set of normalized English names that exist in the playtest client.
  const playtestNames = new Set();
  // Also keep the original casing for display.
  const playtestNamesOriginal = new Map(); // norm → original
  for (const localized of idToLocal.values()) {
    const n = norm(localized);
    if (!n) continue;
    playtestNames.add(n);
    if (!playtestNamesOriginal.has(n)) playtestNamesOriginal.set(n, localized);
  }
  console.log(`Datamine: ${idToLocal.size} m_Id → name entries, ${playtestNames.size} unique normalized names.`);

  // Also build key → localized for fallback matching when BeastBurst still
  // hands back a raw key.
  const keyToLocal = new Map();
  for (const [key, id] of keyToId) {
    const loc = idToLocal.get(id);
    if (loc) keyToLocal.set(key, loc);
  }

  console.log('Fetching items from Sanity...');
  const items = await client.fetch(
    '*[_type == "item"]{ _id, externalId, name, "slug": slug.current, itemType, slotType, rarity }',
  );
  console.log(`Sanity: ${items.length} items.`);

  const matched = []; // BeastBurst item is in playtest client
  const unmatched = []; // BeastBurst item is NOT in playtest client
  const unresolvedKeys = []; // BeastBurst still hands back a raw key we can't resolve

  for (const it of items) {
    let displayName = it.name;
    if (looksLikeKey(it.name)) {
      const resolved = keyToLocal.get(it.name);
      if (!resolved) {
        unresolvedKeys.push({ id: it.externalId, name: it.name });
        continue;
      }
      displayName = resolved;
    }
    const n = norm(displayName);
    if (playtestNames.has(n)) {
      matched.push({ id: it.externalId, name: displayName, slug: it.slug, itemType: it.itemType, slotType: it.slotType, rarity: it.rarity });
    } else {
      unmatched.push({ id: it.externalId, name: displayName, slug: it.slug, itemType: it.itemType, slotType: it.slotType, rarity: it.rarity });
    }
  }

  // Reverse direction: which playtest names are NOT covered by any BeastBurst item?
  const beastBurstNamesNorm = new Set();
  for (const it of items) {
    let dn = it.name;
    if (looksLikeKey(it.name)) {
      const r = keyToLocal.get(it.name);
      if (r) dn = r;
    }
    beastBurstNamesNorm.add(norm(dn));
  }
  const playtestOnly = [];
  for (const [n, original] of playtestNamesOriginal) {
    if (!beastBurstNamesNorm.has(n)) playtestOnly.push(original);
  }

  // Group unmatched (BeastBurst-only) by rarity + slot to see if a pattern emerges.
  const unmatchedByRarity = {};
  for (const u of unmatched) {
    const k = u.rarity || '(none)';
    unmatchedByRarity[k] = (unmatchedByRarity[k] || 0) + 1;
  }
  const unmatchedBySlot = {};
  for (const u of unmatched) {
    const k = u.slotType || u.itemType || '(none)';
    unmatchedBySlot[k] = (unmatchedBySlot[k] || 0) + 1;
  }
  const matchedByRarity = {};
  for (const m of matched) {
    const k = m.rarity || '(none)';
    matchedByRarity[k] = (matchedByRarity[k] || 0) + 1;
  }

  const report = {
    summary: {
      datamineUniqueNames: playtestNames.size,
      datamineRawEntries: idToLocal.size,
      sanityItems: items.length,
      matched: matched.length,
      unmatched: unmatched.length,
      unresolvedKeys: unresolvedKeys.length,
      playtestOnly: playtestOnly.length,
      matchRate: ((matched.length / items.length) * 100).toFixed(1) + '%',
    },
    matchedByRarity,
    unmatchedByRarity,
    unmatchedBySlot,
    samples: {
      matched: matched.slice(0, 20),
      unmatched: unmatched.slice(0, 30),
      unresolvedKeys: unresolvedKeys.slice(0, 20),
      playtestOnly: playtestOnly.slice(0, 30),
    },
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify({
    ...report,
    matched, // full lists at the bottom
    unmatched,
    unresolvedKeys,
    playtestOnly,
  }, null, 2));

  // Markdown summary for quick eyeballing.
  const md = [];
  md.push('# Playtest match report');
  md.push('');
  md.push('## Summary');
  for (const [k, v] of Object.entries(report.summary)) md.push(`- **${k}**: ${v}`);
  md.push('');
  md.push('## Matched, by rarity');
  for (const [k, v] of Object.entries(matchedByRarity)) md.push(`- ${k}: ${v}`);
  md.push('');
  md.push('## Unmatched (BeastBurst-only) by rarity');
  for (const [k, v] of Object.entries(unmatchedByRarity)) md.push(`- ${k}: ${v}`);
  md.push('');
  md.push('## Unmatched (BeastBurst-only) by slot/type');
  for (const [k, v] of Object.entries(unmatchedBySlot).sort((a, b) => b[1] - a[1])) md.push(`- ${k}: ${v}`);
  md.push('');
  md.push('## Sample matched (in playtest)');
  for (const m of report.samples.matched) md.push(`- ${m.name} *(${m.rarity || '?'} ${m.slotType || m.itemType || '?'})*`);
  md.push('');
  md.push('## Sample unmatched (NOT in playtest client)');
  for (const u of report.samples.unmatched) md.push(`- ${u.name} *(${u.rarity || '?'} ${u.slotType || u.itemType || '?'})*`);
  md.push('');
  md.push('## Sample unresolved keys (BeastBurst returns a key not in our map)');
  for (const u of report.samples.unresolvedKeys) md.push(`- ${u.name} (${u.id})`);
  md.push('');
  md.push('## Sample playtest-only (in client but missing from BeastBurst)');
  for (const p of report.samples.playtestOnly) md.push(`- ${p}`);
  fs.writeFileSync(REPORT_MD, md.join('\n'));

  console.log('');
  console.log('=== SUMMARY ===');
  for (const [k, v] of Object.entries(report.summary)) console.log(`  ${k}: ${v}`);
  console.log('');
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Wrote ${REPORT_MD}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
