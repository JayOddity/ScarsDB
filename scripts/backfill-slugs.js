require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function slugify(name) {
  return name
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function assignSlugs(items, existing) {
  const result = new Map();
  const used = new Set();
  for (const item of items) {
    const prior = existing.get(item.id);
    if (prior) {
      result.set(item.id, prior);
      used.add(prior);
    }
  }
  const toAssign = items.filter((i) => !result.has(i.id));
  toAssign.sort((a, b) => a.id.localeCompare(b.id));
  for (const item of toAssign) {
    const base = slugify(item.name);
    if (!base) continue;
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    used.add(slug);
    result.set(item.id, slug);
  }
  return result;
}

async function main() {
  console.log('Fetching items from Sanity...');
  const items = await client.fetch(
    `*[_type == "item"]{ _id, externalId, name, "slug": slug.current }`,
  );
  console.log(`Got ${items.length} items.`);

  const existing = new Map();
  for (const it of items) {
    if (it.slug) existing.set(it.externalId, it.slug);
  }

  const slugMap = assignSlugs(
    items.map((i) => ({ id: i.externalId, name: i.name })),
    existing,
  );

  const patches = items
    .filter((it) => {
      const next = slugMap.get(it.externalId);
      return next && next !== it.slug;
    })
    .map((it) => ({ _id: it._id, slug: slugMap.get(it.externalId) }));

  console.log(`${patches.length} items need a slug update.`);
  if (patches.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  const BATCH = 50;
  let done = 0;
  for (let i = 0; i < patches.length; i += BATCH) {
    const batch = patches.slice(i, i + BATCH);
    let tx = client.transaction();
    for (const p of batch) {
      tx = tx.patch(p._id, (pp) => pp.set({ slug: { _type: 'slug', current: p.slug } }));
    }
    await tx.commit();
    done += batch.length;
    console.log(`Wrote ${done}/${patches.length}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
