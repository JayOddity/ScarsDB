require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const ICON_DIR = path.join(__dirname, '..', 'public', 'Icons', 'Spells');
const URL_RE = /^https:\/\/bb-game\.b-cdn\.net\/spells\/(\d+)\.png$/i;

function localPathFor(n) {
  return `/Icons/Spells/${n}.png`;
}

async function downloadOne(url, destAbs) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destAbs, buf);
  return buf.length;
}

async function main() {
  console.log(APPLY ? 'APPLY mode — files + Sanity will be updated' : 'DRY RUN — pass --apply to write');
  console.log('');

  const spells = await sanityClient.fetch(
    `*[_type=="spell" && icon match "*bb-game.b-cdn.net*"]{ _id, externalId, name, icon }`,
  );
  console.log(`Found ${spells.length} spells with BB CDN icon URLs.`);

  if (spells.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  if (APPLY) await fs.promises.mkdir(ICON_DIR, { recursive: true });

  const toUpdate = [];
  let downloaded = 0, skipped = 0, failed = 0;

  for (const s of spells) {
    const m = URL_RE.exec(s.icon);
    if (!m) {
      console.log(`  skip (unparseable URL): ${s._id} → ${s.icon}`);
      skipped++;
      continue;
    }
    const n = m[1];
    const destAbs = path.join(ICON_DIR, `${n}.png`);
    const localUrl = localPathFor(n);

    if (APPLY) {
      try {
        if (!fs.existsSync(destAbs)) {
          const bytes = await downloadOne(s.icon, destAbs);
          console.log(`  downloaded ${n}.png (${bytes} bytes) ← ${s.name}`);
          downloaded++;
        } else {
          skipped++;
        }
        toUpdate.push({ _id: s._id, icon: localUrl });
      } catch (err) {
        console.log(`  FAIL ${n}.png: ${err.message}`);
        failed++;
      }
    } else {
      const exists = fs.existsSync(destAbs);
      console.log(`  would ${exists ? 'reuse' : 'download'} ${n}.png ← ${s.name} (${s._id})`);
      if (!exists) downloaded++; else skipped++;
      toUpdate.push({ _id: s._id, icon: localUrl });
    }
  }

  console.log('');
  console.log(`Files: ${downloaded} new, ${skipped} existing, ${failed} failed`);
  console.log(`Sanity docs to patch: ${toUpdate.length}`);

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to commit.');
    return;
  }

  if (toUpdate.length === 0) return;
  let tx = sanityClient.transaction();
  for (const u of toUpdate) tx = tx.patch(u._id, { set: { icon: u.icon } });
  await tx.commit();
  console.log(`\nPatched ${toUpdate.length} spell docs in Sanity.`);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
