// Resolve raw localization keys (e.g. "wPolearmSunpiercerExcTKey") on every
// Sanity item to the real English display name pulled from the in-game
// localization tables in the datamining workspace, then re-slug.
//
// Also writes src/lib/itemLocalizationMap.json so the daily import cron
// preserves localized names for any newly-added items shipping with
// key-shaped names from the BeastBurst API.
//
// Usage:
//   node scripts/localize-item-names.js          # dry-run report
//   node scripts/localize-item-names.js --write  # patch Sanity + write manifest

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const WRITE = process.argv.includes('--write');

const SHARED_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items Shared Data/Items Shared Data.txt';
const EN_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items_en/Items_en.txt';
const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'lib', 'itemLocalizationMap.json');

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

function slugify(name) {
  return name
    .replace(/['‘’]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

(async () => {
  const keyToId = parseSharedKeyToId(SHARED_PATH);
  const idToLocal = parseEnIdToLocalized(EN_PATH);

  // Build the full key → localized name map (for the cron manifest).
  const keyToLocal = {};
  for (const [key, id] of keyToId) {
    const loc = idToLocal.get(id);
    if (loc) keyToLocal[key] = loc;
  }
  console.log(`Built localization map: ${Object.keys(keyToLocal).length} key→name entries.`);

  // Fetch every item with its current name + slug + externalId (used for slug stability).
  const items = await client.fetch(
    '*[_type == "item"]{ _id, externalId, name, "slug": slug.current }',
  );
  console.log(`Fetched ${items.length} items from Sanity.`);

  // Build the existing slug map and the desired updates.
  const existingSlugs = new Map(); // externalId -> slug
  const updates = []; // { _id, externalId, oldName, newName }
  let suspected = 0, unresolved = 0, alreadyResolved = 0;
  for (const it of items) {
    if (it.slug) existingSlugs.set(it.externalId, it.slug);
    if (!looksLikeKey(it.name)) { alreadyResolved++; continue; }
    suspected++;
    const local = keyToLocal[it.name];
    if (!local) { unresolved++; continue; }
    updates.push({ _id: it._id, externalId: it.externalId, oldName: it.name, newName: local });
  }
  console.log(`Already resolved (no key-shaped name): ${alreadyResolved}`);
  console.log(`Key-shaped names: ${suspected}`);
  console.log(`  resolvable (will rename): ${updates.length}`);
  console.log(`  unresolved (left alone):  ${unresolved}`);

  // Compute new slugs. Items being renamed get a fresh slug; everyone else
  // keeps the slug they already have (we pass them as "existing" so the
  // assignSlugs-style dedup will route around them).
  const renamingIds = new Set(updates.map((u) => u.externalId));
  const lockedSlugs = new Set();
  for (const it of items) {
    if (it.slug && !renamingIds.has(it.externalId)) lockedSlugs.add(it.slug);
  }
  // Sort so renaming order is deterministic.
  updates.sort((a, b) => a.externalId.localeCompare(b.externalId));
  const newSlugs = new Map();
  for (const u of updates) {
    const base = slugify(u.newName);
    if (!base) continue;
    let slug = base, n = 2;
    while (lockedSlugs.has(slug) || newSlugs.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    newSlugs.set(slug, u.externalId);
    u.newSlug = slug;
  }

  console.log('\nSample renames:');
  for (const u of updates.slice(0, 8)) {
    console.log(`  ${u.oldName} → ${u.newName}  (${u.newSlug})`);
  }

  if (!WRITE) {
    console.log('\nDry run. Re-run with --write to patch Sanity + write the manifest.');
    return;
  }

  // Write the manifest first so it's safe to commit even if the Sanity batch
  // partially fails.
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(keyToLocal, null, 2));
  console.log(`\nWrote manifest to src/lib/itemLocalizationMap.json (${Object.keys(keyToLocal).length} entries).`);

  // Patch Sanity in batches.
  let done = 0;
  for (let i = 0; i < updates.length; i += 25) {
    const batch = updates.slice(i, i + 25);
    let tx = client.transaction();
    for (const u of batch) {
      tx = tx.patch(u._id, (p) => p.set({
        name: u.newName,
        slug: { _type: 'slug', current: u.newSlug },
      }));
    }
    await tx.commit();
    done += batch.length;
    if (done % 100 === 0 || done === updates.length) {
      console.log(`  patched ${done}/${updates.length}`);
    }
  }
  console.log(`Done — ${done} items renamed and re-slugged.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
