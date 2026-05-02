// Mirror BeastBurst item icons from the local datamining workspace into
// wip/public/Icons/items/ and rewrite each Sanity item's `icon` field to the
// local path so we don't depend on the (currently 403'ing) BunnyCDN.
//
// Usage:
//   node scripts/mirror-item-icons.js          # dry-run report
//   node scripts/mirror-item-icons.js --write  # copy files + update Sanity

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const WRITE = process.argv.includes('--write');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const SOURCE_DIRS = [
  'E:/Website Stuff/Datamining/output/sprites_data_unity3d',
  'E:/Website Stuff/Datamining/output/addressables_sprites',
];
const DEST_DIR = path.join(__dirname, '..', 'public', 'Icons', 'items');
const PUBLIC_PREFIX = '/Icons/items';

function indexLocalFiles() {
  const map = new Map(); // filename → absolute source path (first match wins)
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.toLowerCase().endsWith('.png')) continue;
      if (!map.has(name)) map.set(name, path.join(dir, name));
    }
  }
  return map;
}

function findMatch(originalUrl, localFiles) {
  if (!originalUrl) return null;
  const fn = decodeURIComponent(originalUrl.split('/').pop().split('?')[0] || '');
  if (!fn || fn === '40x40' || fn.includes('placehold')) return null;
  if (localFiles.has(fn)) return { matched: fn, kind: 'direct' };
  // BunnyCDN names append a numeric suffix per item id (e.g. _62309). Strip it.
  const base = fn.replace(/_\d+(\.png)$/i, '$1');
  if (base !== fn && localFiles.has(base)) return { matched: base, kind: 'suffix' };
  return null;
}

(async () => {
  const localFiles = indexLocalFiles();
  console.log(`Indexed ${localFiles.size} local PNGs from datamining sources.`);

  const items = await client.fetch(
    '*[_type == "item" && defined(icon)]{ _id, name, icon }',
  );
  console.log(`Fetched ${items.length} items from Sanity.`);

  let direct = 0, suffix = 0, alreadyLocal = 0, placeholder = 0, noMatch = 0;
  const noMatchExamples = [];
  const toCopy = new Map(); // localFilename → sourcePath
  const updates = []; // { _id, newPath }

  for (const item of items) {
    const url = item.icon;
    if (url.startsWith('/Icons/items/')) { alreadyLocal++; continue; }
    const fn = decodeURIComponent(url.split('/').pop().split('?')[0] || '');
    if (!fn || fn === '40x40' || fn.includes('placehold')) { placeholder++; continue; }
    const match = findMatch(url, localFiles);
    if (!match) {
      noMatch++;
      if (noMatchExamples.length < 8) noMatchExamples.push({ name: item.name, icon: fn });
      continue;
    }
    if (match.kind === 'direct') direct++; else suffix++;
    toCopy.set(match.matched, localFiles.get(match.matched));
    updates.push({ _id: item._id, newPath: `${PUBLIC_PREFIX}/${match.matched}` });
  }

  console.log('---');
  console.log(`Already local:     ${alreadyLocal}`);
  console.log(`Direct match:      ${direct}`);
  console.log(`Strip-suffix match:${suffix}`);
  console.log(`Placeholder URLs:  ${placeholder} (left untouched)`);
  console.log(`No match:          ${noMatch} (left untouched)`);
  console.log(`Files to copy:     ${toCopy.size} unique PNGs`);
  console.log(`Sanity updates:    ${updates.length}`);
  if (noMatchExamples.length) {
    console.log('Sample misses:');
    for (const m of noMatchExamples) console.log(`  ${m.name} → ${m.icon}`);
  }

  if (!WRITE) {
    console.log('\nDry run. Re-run with --write to copy files and patch Sanity.');
    return;
  }

  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

  let copied = 0, skipped = 0;
  for (const [name, src] of toCopy) {
    const dst = path.join(DEST_DIR, name);
    if (fs.existsSync(dst)) { skipped++; continue; }
    fs.copyFileSync(src, dst);
    copied++;
  }
  console.log(`Copied ${copied} new PNGs (${skipped} already present).`);

  let patched = 0;
  for (let i = 0; i < updates.length; i += 25) {
    const batch = updates.slice(i, i + 25);
    let tx = client.transaction();
    for (const u of batch) tx = tx.patch(u._id, (p) => p.set({ icon: u.newPath }));
    await tx.commit();
    patched += batch.length;
    if (patched % 100 === 0 || patched === updates.length) {
      console.log(`  patched ${patched}/${updates.length}`);
    }
  }
  console.log(`Done — ${patched} Sanity items updated.`);

  // Write a manifest of locally-mirrored filenames so the daily import cron
  // (which runs serverless and can't read /public reliably) can preserve
  // local paths instead of clobbering them with BunnyCDN URLs.
  const manifestPath = path.join(__dirname, '..', 'src', 'lib', 'itemIconManifest.json');
  const allLocal = fs.existsSync(DEST_DIR)
    ? fs.readdirSync(DEST_DIR).filter((f) => f.toLowerCase().endsWith('.png')).sort()
    : [];
  fs.writeFileSync(manifestPath, JSON.stringify(allLocal, null, 2));
  console.log(`Wrote manifest of ${allLocal.length} local icon filenames to src/lib/itemIconManifest.json`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
