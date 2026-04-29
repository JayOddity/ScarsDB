import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

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

    const conditions: string[] = ['_type == "spell"'];
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
    const start = (page - 1) * perPage;
    const end = start + perPage;

    // For sortable fields, push nulls/empties to the bottom regardless of
    // direction. GROQ uses coalesce + a sentinel string ("zzz" for asc, ""
    // for desc — this works because we sort on a string field with secondary
    // name asc as tie-breaker). For numeric fields, missing values get a
    // sentinel that sorts last in the chosen direction.
    const STR_NULL_ASC = '"zzz_null_zzz"';
    const STR_NULL_DESC = '""';
    const NUM_NULL_ASC = '999999999';
    const NUM_NULL_DESC = '-1';
    const sortFields: Record<string, { type: 'str' | 'num'; field: string }> = {
      name: { type: 'str', field: 'name' },
      class: { type: 'str', field: 'classSpecLevels[0].class' },
      school: { type: 'str', field: 'schoolType' },
      resource: { type: 'str', field: 'requiredResource' },
      target: { type: 'str', field: 'targetType' },
      cast: { type: 'num', field: 'castTime' },
      cooldown: { type: 'num', field: 'cooldown' },
      range: { type: 'num', field: 'maxRange' },
    };
    const sf = sortFields[sortBy] || sortFields.class;
    const sentinel = sf.type === 'str'
      ? (sortDir === 'asc' ? STR_NULL_ASC : STR_NULL_DESC)
      : (sortDir === 'asc' ? NUM_NULL_ASC : NUM_NULL_DESC);
    const orderBy = `coalesce(${sf.field}, ${sentinel}) ${sortDir}, name asc`;

    const [spells, total, schools, resources, flags, classes] = await Promise.all([
      sanityClient.fetch(
        `*[${filter}] | order(${orderBy}) [${start}...${end}] ${SPELL_PROJECTION}`,
        params,
      ),
      sanityClient.fetch<number>(`count(*[${filter}])`, params),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && defined(schoolType)].schoolType) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell" && defined(requiredResource)].requiredResource) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell"].flags[]) | order(@ asc)`),
      sanityClient.fetch<string[]>(`array::unique(*[_type == "spell"].classSpecLevels[].class) | order(@ asc)`),
    ]);

    return NextResponse.json({
      spells,
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
