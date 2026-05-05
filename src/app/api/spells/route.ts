import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

interface Spell {
  _id: string;
  name?: string;
  slug?: string;
  externalId?: string;
  description?: string;
  icon?: string;
  maxRange?: number | null;
  targetType?: string | null;
  channelTime?: number | null;
  castTime?: number | null;
  cooldown?: number | null;
  globalCooldown?: number | null;
  requiredAmount?: number | null;
  requiredResource?: string | null;
  schoolType?: string | null;
  flags?: string[];
  tags?: string[];
  classSpecLevels?: Array<{ class?: string; spec?: string; level?: number }>;
}

const SPELL_PROJECTION = `{
  _id,
  name,
  "slug": slug.current,
  externalId,
  description,
  icon,
  maxRange,
  targetType,
  channelTime,
  castTime,
  cooldown,
  globalCooldown,
  requiredAmount,
  requiredResource,
  schoolType,
  flags,
  tags,
  classSpecLevels
}`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search')?.toLowerCase();
    const school = searchParams.get('school');
    const resource = searchParams.get('resource');
    const flag = searchParams.get('flag');
    const klass = searchParams.get('class');
    const sortBy = searchParams.get('sort_by') || 'class';
    const sortDir = searchParams.get('sort_dir') === 'desc' ? 'desc' : 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('per_page')) || 50;

    // Hide spells with no in-game icon. The matcher script clears `icon` for any
    // spell that doesn't have a datamined PNG, so this filter excludes them site-wide.
    const conditions: string[] = ['_type == "spell"', 'icon match "/Icons/Spells/*"'];
    const params: Record<string, unknown> = {};

    if (search) {
      conditions.push('name match $search');
      params.search = `*${search}*`;
    }
    if (school) {
      conditions.push('schoolType == $school');
      params.school = school;
    }
    if (resource) {
      conditions.push('requiredResource == $resource');
      params.resource = resource;
    }
    if (flag) {
      conditions.push('$flag in flags');
      params.flag = flag;
    }
    if (klass) {
      conditions.push('$klass in classSpecLevels[].class');
      params.klass = klass;
    }

    const filter = conditions.join(' && ');

    // Fetch all matching docs (the visible-spell set is small after the icon filter,
    // currently ~82 rows) so we can dedupe sibling entries — BeastBurst returns
    // multiple spell docs for the same display name (different ranks/specs/internal
    // variants, all with identical name/icon). Pick the one with classSpecLevels
    // populated as the canonical row, then sort + paginate in JS.
    const [allSpells, schools, resources, flags, classes] = await Promise.all([
      sanityClient.fetch<Spell[]>(
        `*[${filter}] ${SPELL_PROJECTION}`,
        params,
      ),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && icon match "/Icons/Spells/*" && defined(schoolType)].schoolType) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && icon match "/Icons/Spells/*" && defined(requiredResource)].requiredResource) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && icon match "/Icons/Spells/*"].flags[]) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && icon match "/Icons/Spells/*"].classSpecLevels[].class) | order(@ asc)`),
    ]);

    const byName = new Map<string, Spell>();
    for (const s of allSpells) {
      const key = s.name || s._id;
      const existing = byName.get(key);
      if (!existing) { byName.set(key, s); continue; }
      const existingRank = (existing.classSpecLevels?.length || 0);
      const candidateRank = (s.classSpecLevels?.length || 0);
      if (candidateRank > existingRank) byName.set(key, s);
    }
    const unique = Array.from(byName.values());

    const sortMul = sortDir === 'asc' ? 1 : -1;
    const cmp = (a: Spell, b: Spell): number => {
      const numField = (s: Spell) => {
        switch (sortBy) {
          case 'cast': return s.castTime;
          case 'cooldown': return s.cooldown;
          case 'range': return s.maxRange;
          default: return null;
        }
      };
      const strField = (s: Spell) => {
        switch (sortBy) {
          case 'name': return s.name;
          case 'school': return s.schoolType;
          case 'resource': return s.requiredResource;
          case 'target': return s.targetType;
          case 'class': return s.classSpecLevels?.[0]?.class;
          default: return null;
        }
      };
      const isNum = ['cast', 'cooldown', 'range'].includes(sortBy);
      if (isNum) {
        const av = numField(a), bv = numField(b);
        const an = av == null ? Number.POSITIVE_INFINITY : av;
        const bn = bv == null ? Number.POSITIVE_INFINITY : bv;
        if (an !== bn) return (an - bn) * sortMul;
      } else {
        const av = strField(a) || '￿';
        const bv = strField(b) || '￿';
        const c = av.localeCompare(bv);
        if (c !== 0) return c * sortMul;
      }
      return (a.name || '').localeCompare(b.name || '');
    };
    unique.sort(cmp);

    const total = unique.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paged = unique.slice(start, end);

    return NextResponse.json({
      spells: paged,
      meta: {
        total,
        page,
        per_page: perPage,
        last_page: Math.ceil(total / perPage),
      },
      filters: { schools, resources, flags, classes: classes.filter(Boolean) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch spells', details: String(error) },
      { status: 500 }
    );
  }
}
