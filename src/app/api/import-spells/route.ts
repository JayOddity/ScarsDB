import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { formatSpellName } from '@/lib/spellName';

const API_BASE = process.env.BEASTBURST_API_URL || 'https://developers.beastburst.com/api/community';
const API_TOKEN = process.env.BEASTBURST_API_TOKEN || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

interface BeastBurstSpell {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  max_range?: number;
  target_type?: string;
  channel_time?: number;
  cast_time?: number;
  cooldown?: number;
  global_cooldown?: number;
  required_amount?: number;
  required_resource?: { name: string };
  school_type?: { name: string };
  flags?: string[];
  tags?: Array<string | { name: string }>;
  class_spec_levels?: Array<{ class?: string; class_name?: string; spec?: string; spec_name?: string; level?: number }>;
}

function slugify(name: string) {
  return formatSpellName(name)
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function assignSlugs(spells: { id: string; name: string }[], existing: Map<string, string>) {
  const result = new Map<string, string>();
  const used = new Set<string>();
  for (const s of spells) {
    const prior = existing.get(s.id);
    if (prior) { result.set(s.id, prior); used.add(prior); }
  }
  const toAssign = spells.filter((s) => !result.has(s.id)).sort((a, b) => a.id.localeCompare(b.id));
  for (const s of toAssign) {
    const base = slugify(s.name);
    if (!base) continue;
    let slug = base;
    let n = 2;
    while (used.has(slug)) { slug = `${base}-${n}`; n++; }
    used.add(slug);
    result.set(s.id, slug);
  }
  return result;
}

async function fetchPage(page: number) {
  const res = await fetch(`${API_BASE}/spells?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-API-Version': '2.0.0',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`API error page ${page}: ${res.status}`);
  return res.json();
}

function mapSpell(s: BeastBurstSpell, slug: string | undefined) {
  const doc: { _id: string; _type: string; [key: string]: unknown } = {
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
  return doc;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  const validAuth = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET;
  if (!validAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const firstPage = await fetchPage(1);
    const lastPage = firstPage.meta.last_page;
    const firstList: BeastBurstSpell[] = firstPage.data.spells || firstPage.data || [];
    let allSpells: BeastBurstSpell[] = [...firstList];

    for (let page = 2; page <= lastPage; page++) {
      const data = await fetchPage(page);
      const list: BeastBurstSpell[] = data.data.spells || data.data || [];
      allSpells = allSpells.concat(list);
    }

    const existingRows = await sanityWriteClient.fetch<Array<{ externalId: string; slug: string }>>(
      `*[_type == "spell" && defined(slug.current)]{ externalId, "slug": slug.current }`,
    );
    const existing = new Map<string, string>();
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
      let tx = sanityWriteClient.transaction();
      for (const doc of batch) tx = tx.createOrReplace(doc);
      await tx.commit();
      written += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${written} spells from ${lastPage} pages`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Spell import failed', details: String(error) },
      { status: 500 }
    );
  }
}
