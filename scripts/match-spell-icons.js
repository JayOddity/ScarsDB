require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--verbose');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const PROJECT_DIR = path.join(__dirname, '..');
const PUBLIC_ABILITIES = path.join(PROJECT_DIR, 'public', 'Icons', 'Talents', 'abilities');
const PUBLIC_SPELLS = path.join(PROJECT_DIR, 'public', 'Icons', 'Spells');
const DATAMINE = 'E:/Website Stuff/Datamining/output';
const SOURCE_DIRS = [
  PUBLIC_ABILITIES,
  path.join(DATAMINE, 'addressables_sprites'),
  path.join(DATAMINE, 'sprites_data_unity3d'),
];

function formatSpellName(raw) {
  if (!raw) return '';
  const hasKey = /(NameKey|DescKey|Key)$/.test(raw);
  const isCamel = !raw.includes(' ') && /^[a-z][a-zA-Z0-9]*[A-Z]/.test(raw);
  if (!hasKey && !isCamel) return raw;
  let s = raw.replace(/(NameKey|DescKey|Key)$/, '');
  if (s.includes(' ')) return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  s = s.replace(/^(\d+)([a-zA-Z])/, '$1 $2');
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

// Strip everything to a single lowercase alphanumeric string for matching
function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Try to extract a comparable "core name" from a filename like:
//   IconSpell_BlackHole.png   → "blackhole"
//   aegis_sphere_icon.png     → "aegissphere"
//   warrior_disembowel_01.png → "warriordisembowel" (drops trailing _01)
//   IconSpell_BlazeOfGlory 1.png → "blazeofglory" (drops trailing " 1")
function fileCore(filename) {
  let s = filename.replace(/\.[a-z0-9]+$/i, ''); // strip extension
  s = s.replace(/_#\d+$/i, '');                  // strip _#NNN variant marker
  s = s.replace(/[ _-]\d+$/, '');                // strip trailing _01, " 1"
  s = s.replace(/\s*\(\d+\)$/, '');              // strip trailing (1)
  s = s.replace(/^IconSpell[_-]/i, '');
  s = s.replace(/^Icon[_-]/i, '');
  s = s.replace(/[_-]?icon$/i, '');
  return norm(s);
}

function buildCatalog() {
  const map = new Map(); // normCore → { absPath, srcLabel, basename }
  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const label = dir.includes('Datamining') ? 'datamine' : 'public';
    for (const file of fs.readdirSync(dir)) {
      if (!/\.png$/i.test(file)) continue;
      if (/_#\d+\.png$/i.test(file)) continue;       // skip color variants
      if (/(_ph|placeholder)/i.test(file)) continue; // skip placeholder art
      const core = fileCore(file);
      if (!core || core.length < 3) continue;
      // Prefer public over datamine, prefer shortest name (less variant)
      const existing = map.get(core);
      if (!existing || (label === 'public' && existing.srcLabel !== 'public') ||
          (label === existing.srcLabel && file.length < existing.basename.length)) {
        map.set(core, { absPath: path.join(dir, file), srcLabel: label, basename: file });
      }
    }
  }
  return map;
}

function findMatch(spellName, catalog) {
  const display = formatSpellName(spellName);
  const target = norm(display);
  if (!target || target.length < 3) return null;

  // 1. Exact
  if (catalog.has(target)) return { ...catalog.get(target), kind: 'exact', target, display };

  // 2. Strip leading "spawn" / "unlock" wrappers (e.g., spawnMountHorseKey → "Mount Horse")
  const stripped = target.replace(/^(spawn|unlock|use)/, '');
  if (stripped !== target && stripped.length >= 3 && catalog.has(stripped)) {
    return { ...catalog.get(stripped), kind: 'stripped', target: stripped, display };
  }

  // 3. Tight prefix/suffix containment — file-core must be at the start or end of spell-core,
  // and length ratio must be >= 0.7 (so "blackhole" matches "npcblackhole" but not "spiderblackhole").
  if (target.length >= 6) {
    let candidate = null;
    for (const [k, v] of catalog) {
      if (k === target) continue;
      if (k.length < 4) continue;
      const longer = Math.max(k.length, target.length);
      const shorter = Math.min(k.length, target.length);
      if (shorter / longer < 0.7) continue;
      const isPrefix = target.startsWith(k) || k.startsWith(target);
      const isSuffix = target.endsWith(k) || k.endsWith(target);
      if (!isPrefix && !isSuffix) continue;
      if (candidate) return null; // ambiguous
      candidate = { ...v, kind: 'contains', target, display, matchedKey: k };
    }
    if (candidate) return candidate;
  }

  return null;
}

async function main() {
  console.log(APPLY ? 'APPLY mode — files copied + Sanity will be patched' : 'DRY RUN — pass --apply to write');
  console.log('');

  const catalog = buildCatalog();
  console.log(`Catalog: ${catalog.size} unique icon cores (across ${SOURCE_DIRS.filter((d) => fs.existsSync(d)).length} source dirs)`);

  const spells = await sanityClient.fetch(
    `*[_type=="spell"]{ _id, externalId, name, icon }`,
  );
  console.log(`Sanity spells: ${spells.length}`);
  console.log('');

  const matches = [];
  const unmatched = [];
  for (const s of spells) {
    const m = findMatch(s.name, catalog);
    if (m) matches.push({ spell: s, match: m });
    else unmatched.push(s);
  }

  const byKind = matches.reduce((acc, x) => { acc[x.match.kind] = (acc[x.match.kind] || 0) + 1; return acc; }, {});
  console.log(`Matches: ${matches.length}/${spells.length}`);
  for (const [k, v] of Object.entries(byKind)) console.log(`  ${k}: ${v}`);
  console.log(`Unmatched: ${unmatched.length} (will have icon cleared)`);

  if (VERBOSE) {
    console.log('\n--- MATCHES ---');
    for (const { spell, match } of matches) {
      console.log(`  [${match.kind}] ${spell.name} → ${match.basename} (${match.srcLabel})`);
    }
    console.log('\n--- UNMATCHED (first 30) ---');
    for (const s of unmatched.slice(0, 30)) console.log(`  ${s.name}`);
  }

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to commit (use --verbose to see all matches).');
    return;
  }

  await fs.promises.mkdir(PUBLIC_SPELLS, { recursive: true });

  const patches = [];
  let copiedNew = 0;
  let copiedExisting = 0;
  for (const { spell, match } of matches) {
    const safeBase = match.basename.replace(/[^A-Za-z0-9_.()-]/g, '_');
    const destAbs = path.join(PUBLIC_SPELLS, safeBase);
    const localUrl = `/Icons/Spells/${safeBase}`;
    if (!fs.existsSync(destAbs)) {
      await fs.promises.copyFile(match.absPath, destAbs);
      copiedNew++;
    } else {
      copiedExisting++;
    }
    if (spell.icon !== localUrl) patches.push({ _id: spell._id, set: { icon: localUrl } });
  }

  // Clear icon for unmatched spells (only if currently set)
  const clears = [];
  for (const s of unmatched) {
    if (s.icon) clears.push({ _id: s._id, unset: ['icon'] });
  }

  console.log(`\nFiles: ${copiedNew} copied, ${copiedExisting} reused`);
  console.log(`Sanity: ${patches.length} icon patches, ${clears.length} icon clears`);

  if (patches.length === 0 && clears.length === 0) {
    console.log('Sanity already up to date.');
    return;
  }

  const ops = [...patches, ...clears];
  const BATCH = 50;
  for (let i = 0; i < ops.length; i += BATCH) {
    const chunk = ops.slice(i, i + BATCH);
    let tx = sanityClient.transaction();
    for (const op of chunk) {
      if (op.set) tx = tx.patch(op._id, { set: op.set });
      else if (op.unset) tx = tx.patch(op._id, { unset: op.unset });
    }
    await tx.commit();
  }
  console.log(`Done — ${ops.length} Sanity ops committed.`);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
