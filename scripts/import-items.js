require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Locally-mirrored item icons, populated by scripts/mirror-item-icons.js.
// We read this at startup so the daily cron preserves local paths for any
// CDN URL whose filename (or its strip-suffix base name) matches a file we
// already have on disk. Anything unmatched falls back to the BunnyCDN URL
// the API returned — so newly-added items still appear if/when the CDN
// works again, and re-mirroring picks them up later.
const LOCAL_ICONS_DIR = path.join(__dirname, '..', 'public', 'Icons', 'items');
const LOCAL_ICONS = (() => {
  try {
    if (!fs.existsSync(LOCAL_ICONS_DIR)) return new Set();
    return new Set(fs.readdirSync(LOCAL_ICONS_DIR).filter((f) => f.toLowerCase().endsWith('.png')));
  } catch { return new Set(); }
})();
function localizeIconUrl(url) {
  if (!url) return url;
  if (url.startsWith('/Icons/items/')) return url;
  const fn = decodeURIComponent(url.split('/').pop().split('?')[0] || '');
  if (!fn || fn === '40x40' || fn.includes('placehold')) return url;
  if (LOCAL_ICONS.has(fn)) return `/Icons/items/${fn}`;
  const base = fn.replace(/_\d+(\.png)$/i, '$1');
  if (base !== fn && LOCAL_ICONS.has(base)) return `/Icons/items/${base}`;
  return url;
}

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const API_BASE = process.env.BEASTBURST_API_URL || 'https://developers.beastburst.com/api/community';
const API_TOKEN = process.env.BEASTBURST_API_TOKEN;

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

async function fetchPage(page) {
  const res = await fetch(`${API_BASE}/items?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-API-Version': '2.0.0',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`API error on page ${page}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function mapItem(item, slug) {
  const doc = {
    _type: 'item',
    _id: 'item-' + item.id,
    name: item.name,
    itemType: item.type,
    rarity: item.rarity,
    icon: localizeIconUrl(item.icon),
    slotType: item.slot_type,
    stackSize: item.stack_size,
    isDestructible: item.is_destructible,
    sellValue: item.sell_value,
    externalId: item.id,
    ...(slug ? { slug: { _type: 'slug', current: slug } } : {}),
  };

  if (
    item.stat_configuration &&
    item.stat_configuration.lists &&
    item.stat_configuration.lists.length > 0
  ) {
    doc.statLists = item.stat_configuration.lists.map((list, li) => ({
      _type: 'statPool',
      _key: `pool-${li}`,
      minStatCount: list.min_stat_count,
      maxStatCount: list.max_stat_count,
      modifications: (list.modifications || []).map((mod, mi) => ({
        _type: 'statMod',
        _key: `mod-${li}-${mi}`,
        stat: mod.stat,
        modifType: mod.modif_type,
        modifWeight: mod.modif_weight,
        minValue: mod.modif_min_value,
        maxValue: mod.modif_max_value,
      })),
    }));
  }

  return doc;
}

async function writeBatch(docs) {
  let tx = sanityClient.transaction();
  for (const doc of docs) {
    tx = tx.createOrReplace(doc);
  }
  await tx.commit();
}

async function main() {
  console.log('Starting item import...');

  const firstPage = await fetchPage(1);
  const lastPage = firstPage.meta.last_page;
  console.log(`Total pages: ${lastPage}`);

  let allItems = [...firstPage.data.items];
  console.log(`Fetched page 1 (${firstPage.data.items.length} items)`);

  for (let page = 2; page <= lastPage; page++) {
    const data = await fetchPage(page);
    allItems = allItems.concat(data.data.items);
    if (page % 10 === 0) {
      console.log(`Fetched page ${page}/${lastPage} (${allItems.length} items so far)`);
    }
  }

  console.log(`\nTotal items fetched: ${allItems.length}`);
  console.log('Resolving slugs against existing Sanity data...');

  const existingRows = await sanityClient.fetch(
    `*[_type == "item" && defined(slug.current)]{ externalId, "slug": slug.current }`,
  );
  const existing = new Map();
  for (const r of existingRows) existing.set(r.externalId, r.slug);

  const slugMap = assignSlugs(
    allItems.map((i) => ({ id: i.id, name: i.name })),
    existing,
  );

  console.log('Mapping items to Sanity documents...');
  const docs = allItems.map((i) => mapItem(i, slugMap.get(i.id)));

  const BATCH_SIZE = 20;
  let written = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await writeBatch(batch);
    written += batch.length;

    if (written % 100 === 0 || written === docs.length) {
      console.log(`Progress: ${written}/${docs.length} items written to Sanity`);
    }
  }

  console.log(`\nDone! Successfully imported ${written} items.`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
