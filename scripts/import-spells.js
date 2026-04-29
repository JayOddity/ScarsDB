require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const API_BASE = process.env.BEASTBURST_API_URL || 'https://developers.beastburst.com/api/community';
const API_TOKEN = process.env.BEASTBURST_API_TOKEN;

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
  return formatSpellName(name)
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function assignSlugs(spells, existing) {
  const result = new Map();
  const used = new Set();
  for (const s of spells) {
    const prior = existing.get(s.id);
    if (prior) {
      result.set(s.id, prior);
      used.add(prior);
    }
  }
  const toAssign = spells.filter((s) => !result.has(s.id));
  toAssign.sort((a, b) => a.id.localeCompare(b.id));
  for (const s of toAssign) {
    const base = slugify(s.name);
    if (!base) continue;
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    used.add(slug);
    result.set(s.id, slug);
  }
  return result;
}

async function fetchPage(page) {
  const res = await fetch(`${API_BASE}/spells?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-API-Version': '2.0.0',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`API error on page ${page}: ${res.status} ${res.statusText}`);
  return res.json();
}

function mapSpell(s, slug) {
  return {
    _type: 'spell',
    _id: 'spell-' + s.id,
    name: s.name,
    description: s.description || '',
    icon: s.icon,
    externalId: s.id,
    maxRange: s.max_range,
    targetType: s.target_type,
    channelTime: s.channel_time,
    castTime: s.cast_time,
    cooldown: s.cooldown,
    globalCooldown: s.global_cooldown,
    requiredAmount: s.required_amount,
    requiredResource: s.required_resource?.name || null,
    schoolType: s.school_type?.name || null,
    flags: Array.isArray(s.flags) ? s.flags : [],
    tags: Array.isArray(s.tags) ? s.tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean) : [],
    classSpecLevels: (Array.isArray(s.class_spec_levels) ? s.class_spec_levels : []).map((csl, i) => ({
      _type: 'object',
      _key: `csl-${i}`,
      class: csl.class || csl.class_name || null,
      spec: csl.spec || csl.spec_name || null,
      level: csl.level,
    })),
    ...(slug ? { slug: { _type: 'slug', current: slug } } : {}),
  };
}

async function writeBatch(docs) {
  let tx = sanityClient.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();
}

async function main() {
  console.log('Starting spell import...');
  const firstPage = await fetchPage(1);
  const lastPage = firstPage.meta.last_page;
  console.log(`Total pages: ${lastPage}`);

  const firstList = firstPage.data.spells || firstPage.data || [];
  let allSpells = [...firstList];
  console.log(`Fetched page 1 (${firstList.length} spells)`);

  for (let page = 2; page <= lastPage; page++) {
    const data = await fetchPage(page);
    const list = data.data.spells || data.data || [];
    allSpells = allSpells.concat(list);
    if (page % 5 === 0) console.log(`Fetched page ${page}/${lastPage} (${allSpells.length} so far)`);
  }

  console.log(`\nTotal spells fetched: ${allSpells.length}`);

  const existingRows = await sanityClient.fetch(
    `*[_type == "spell" && defined(slug.current)]{ externalId, "slug": slug.current }`,
  );
  const existing = new Map();
  for (const r of existingRows) existing.set(r.externalId, r.slug);

  const slugMap = assignSlugs(
    allSpells.map((s) => ({ id: s.id, name: s.name })),
    existing,
  );

  const docs = allSpells.map((s) => mapSpell(s, slugMap.get(s.id)));
  const BATCH_SIZE = 20;
  let written = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await writeBatch(batch);
    written += batch.length;
    if (written % 100 === 0 || written === docs.length) {
      console.log(`Progress: ${written}/${docs.length}`);
    }
  }
  console.log(`\nDone — imported ${written} spells.`);
}

main().catch((err) => {
  console.error('Spell import failed:', err);
  process.exit(1);
});
