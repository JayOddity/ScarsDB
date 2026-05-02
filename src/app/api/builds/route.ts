import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { generateShortCode } from '@/lib/shortCode';
import { checkRateLimit } from '@/lib/rateLimit';
import { getBuildViewCounts } from '@/lib/buildViewTracker';
import { auth } from '@/lib/auth';
import { validateText } from '@/lib/profanityFilter';
import { isUserBanned } from '@/lib/bannedUsers';
import { classes } from '@/data/classes';

const VALID_CLASS_SLUGS = classes.map((c) => c.slug);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classSlug = searchParams.get('class');
    const tag = searchParams.get('tag');
    const patch = searchParams.get('patch');
    const sort = searchParams.get('sort') || 'newest';
    const mine = searchParams.get('mine') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);
    const offset = (page - 1) * limit;

    let filter = '*[_type == "talentBuild"';
    const params: Record<string, string | number> = { limit, offset };
    if (classSlug && VALID_CLASS_SLUGS.includes(classSlug)) {
      filter += ' && classSlug == $classSlug';
      params.classSlug = classSlug;
    }
    if (tag && ['pvp', 'pve', 'leveling', 'beginner'].includes(tag)) {
      filter += ' && $tag in tags';
      params.tag = tag;
    }
    if (patch && patch.length > 0 && patch.length < 50) {
      filter += ' && patch == $patch';
      params.patch = patch;
    }
    if (mine) {
      const session = await auth();
      const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;
      if (!userId) {
        return NextResponse.json({ builds: [], total: 0, page: 1, pages: 0 });
      }
      filter += ' && author._ref == $userId';
      params.userId = userId;
    } else {
      // Community list only shows published builds. /mine sees both private and public.
      filter += ' && isPublic == true';
    }
    filter += ']';

    const fields = '{ code, classSlug, allocation, equipment, name, tags, difficulty, description, guide, patch, totalPoints, upvotes, downvotes, createdAt, isPublic, publishedAt, "authorName": author->displayName, "authorImage": author->image, "authorRef": author._ref }';

    if (sort === 'popular') {
      // Fetch all builds, rank by in-memory view counts
      const allBuilds = await sanityWriteClient.fetch(
        `${filter} | order(coalesce(publishedAt, createdAt) desc) ${fields}`,
        params,
      );
      const viewCounts = getBuildViewCounts();
      const withViews = allBuilds.map((b: { code: string }) => ({
        ...b,
        views: viewCounts.get(b.code) || 0,
      }));
      withViews.sort((a: { views: number }, b: { views: number }) => b.views - a.views);
      const total = withViews.length;
      const paged = withViews.slice(offset, offset + limit);
      return NextResponse.json({ builds: paged, total, page, pages: Math.ceil(total / limit) });
    }

    if (sort === 'top') {
      // Sort by net votes (upvotes - downvotes)
      const [builds, total] = await Promise.all([
        sanityWriteClient.fetch(
          `${filter} | order((coalesce(upvotes,0) - coalesce(downvotes,0)) desc) [$offset...$offset + $limit] ${fields}`,
          params,
        ),
        sanityWriteClient.fetch(`count(${filter})`, params),
      ]);
      return NextResponse.json({ builds, total, page, pages: Math.ceil(total / limit) });
    }

    // Newest sort: prefer publishedAt for community list (so republishes float),
    // fall back to createdAt for unpublished /mine entries.
    const [builds, total] = await Promise.all([
      sanityWriteClient.fetch(
        `${filter} | order(coalesce(publishedAt, createdAt) desc) [$offset...$offset + $limit] ${fields}`,
        params,
      ),
      sanityWriteClient.fetch(`count(${filter})`, params),
    ]);

    return NextResponse.json({ builds, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch builds', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Saves are anon-friendly. Builds default to PRIVATE (isPublic=false) — unique
  // link only. Author attribution and the community listing require a separate
  // POST /api/builds/[code]/publish action by a signed-in owner.
  const session = await auth();
  const authorId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;

  if (authorId && isUserBanned(authorId)) {
    return NextResponse.json(
      { error: 'Your account has been restricted from creating builds due to a policy violation.' },
      { status: 403 },
    );
  }

  // Rate limit: signed-in users get 10/hr keyed to user; anon gets 5/30min keyed to IP.
  const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const ip = ipHeader.split(',')[0].trim();
  const rateKey = authorId ? `hr-${authorId}` : `anon-${ip}`;
  const rateMax = authorId ? 10 : 5;
  const rateWindow = authorId ? 3_600_000 : 1_800_000;
  const { allowed: hourlyAllowed, remaining } = checkRateLimit(rateKey, rateMax, rateWindow);
  if (!hourlyAllowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Max ${rateMax} builds per ${authorId ? 'hour' : '30 minutes'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateWindow / 1000)) } },
    );
  }

  try {
    const body = await request.json();
    const { classSlug, allocation, name, tags, difficulty, description, guide, patch: patchVersion, equipment } = body;

    if (!classSlug || !VALID_CLASS_SLUGS.includes(classSlug)) {
      return NextResponse.json({ error: 'Invalid class' }, { status: 400 });
    }
    if (!allocation || typeof allocation !== 'string' || allocation.length > 5000) {
      return NextResponse.json({ error: 'Invalid allocation' }, { status: 400 });
    }
    if (!/^(\d+:\d+)(,\d+:\d+)*$/.test(allocation)) {
      return NextResponse.json({ error: 'Invalid allocation format' }, { status: 400 });
    }

    // Profanity check on user-submitted text
    const nameError = typeof name === 'string' ? validateText(name, 'Build name') : null;
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
    const descError = typeof description === 'string' ? validateText(description, 'Description') : null;
    if (descError) return NextResponse.json({ error: descError }, { status: 400 });
    const guideError = typeof guide === 'string' ? validateText(guide, 'Guide') : null;
    if (guideError) return NextResponse.json({ error: guideError }, { status: 400 });

    // Deduplicate: same class + same allocation = return existing code
    const existing = await sanityWriteClient.fetch<string | null>(
      `*[_type == "talentBuild" && classSlug == $classSlug && allocation == $allocation][0].code`,
      { classSlug, allocation },
    );
    if (existing) {
      return appendOwnedCookie(NextResponse.json({ code: existing }), request, existing);
    }

    // Generate unique short code
    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateShortCode();
      const collision = await sanityWriteClient.fetch<number>(
        `count(*[_type == "talentBuild" && code == $code])`,
        { code },
      );
      if (collision === 0) break;
      if (attempt === 4) {
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
      }
    }

    const totalPoints = allocation
      .split(',')
      .reduce((sum, pair) => sum + (parseInt(pair.split(':')[1], 10) || 0), 0);

    if (authorId) {
      const userBuildCount = await sanityWriteClient.fetch<number>(
        `count(*[_type == "talentBuild" && author._ref == $authorId])`,
        { authorId },
      );
      if (userBuildCount >= 50) {
        return NextResponse.json(
          { error: 'Build limit reached. Maximum 50 builds per account.' },
          { status: 403 },
        );
      }
    }

    await sanityWriteClient.create({
      _type: 'talentBuild',
      _id: `build-${code}`,
      code,
      classSlug,
      allocation,
      name: typeof name === 'string' ? name.slice(0, 50) : '',
      tags: Array.isArray(tags) ? tags.filter((t: string) => ['pvp', 'pve', 'leveling', 'beginner'].includes(t)) : [],
      difficulty: typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : '',
      description: typeof description === 'string' ? description.slice(0, 500) : '',
      guide: typeof guide === 'string' ? guide.slice(0, 50000) : '',
      equipment: typeof equipment === 'string' ? equipment.slice(0, 5000) : '',
      patch: typeof patchVersion === 'string' ? patchVersion.slice(0, 50) : 'Spring 2026 Playtest',
      totalPoints,
      upvotes: 0,
      downvotes: 0,
      isPublic: false,
      ...(authorId ? { author: { _type: 'reference', _ref: authorId } } : {}),
      createdAt: new Date().toISOString(),
    });

    const res = NextResponse.json(
      { code },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } },
    );
    return appendOwnedCookie(res, request, code);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save build', details: String(error) },
      { status: 500 },
    );
  }
}

function appendOwnedCookie(res: NextResponse, request: NextRequest, code: string) {
  const existing = request.cookies.get('scarshq-owned-builds')?.value || '';
  const codes = existing ? existing.split(',').filter(Boolean) : [];
  if (!codes.includes(code)) codes.push(code);
  // Cap to 200 to keep the cookie small.
  const trimmed = codes.slice(-200).join(',');
  res.cookies.set('scarshq-owned-builds', trimmed, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    sameSite: 'lax',
    httpOnly: false, // client reads this for instant ownership UI
  });
  return res;
}
