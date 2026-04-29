// One-off: re-slug every existing spell in Sanity to use the formatted name
// (strip NameKey/DescKey/Key, camelCase → spaced, title case).
//
// Run: node scripts/reslug-spells.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function formatSpellName(raw) {
  if (!raw) return '';
  const hasKeySuffix = /(NameKey|DescKey|Key)$/.test(raw);
  const isCamelKey = !raw.includes(' ') && /^[a-z][a-zA-Z0-9]*[A-Z]/.test(raw);
  if (!hasKeySuffix && !isCamelKey) return raw;
  let s = raw.replace(/(NameKey|DescKey|Key)$/, '');
  if (s.includes(' ')) return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  s = s.replace(/^(\d+)([a-zA-Z])/, '$1 $2');
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function slugify(name) {
  const formatted = formatSpellName(name);
  return formatted
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

async function main() {
  const all = await client.fetch(`*[_type == "spell"]{ _id, name, "slug": slug.current }`);
  console.log(`Loaded ${all.length} spells`);

  // Assign new slugs, suffix collisions
  const used = new Set();
  const updates = [];
  const sorted = [...all].sort((a, b) => a._id.localeCompare(b._id));
  for (const s of sorted) {
    const base = slugify(s.name);
    if (!base) continue;
    let next = base;
    let n = 2;
    while (used.has(next)) { next = `${base}-${n}`; n++; }
    used.add(next);
    if (next !== s.slug) updates.push({ _id: s._id, slug: next, oldSlug: s.slug, name: s.name });
  }
  console.log(`Will update ${updates.length} of ${all.length} slugs`);
  if (updates.length === 0) return;

  console.log('First 5 updates:');
  updates.slice(0, 5).forEach((u) => console.log(`  ${u.name}: ${u.oldSlug} → ${u.slug}`));

  const BATCH = 25;
  let written = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    let tx = client.transaction();
    for (const u of updates.slice(i, i + BATCH)) {
      tx = tx.patch(u._id, { set: { slug: { _type: 'slug', current: u.slug } } });
    }
    await tx.commit();
    written += Math.min(BATCH, updates.length - i);
    if (written % 100 === 0 || written === updates.length) {
      console.log(`Progress: ${written}/${updates.length}`);
    }
  }
  console.log(`Done — re-slugged ${written} spells.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
