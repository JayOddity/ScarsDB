import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sanityWriteClient } from '@/lib/sanity';
import { validateText } from '@/lib/profanityFilter';

const RESERVED = new Set([
  'admin', 'administrator', 'mod', 'moderator', 'staff', 'system',
  'scarshq', 'scars', 'support', 'help', 'official', 'team',
  'anonymous', 'anon', 'null', 'undefined', 'guest', 'user',
  'root', 'owner', 'dev', 'developer', 'bot',
]);

const NAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export async function POST(request: NextRequest) {
  const session = await auth();
  const sanityUserId = session?.user?.sanityUserId;
  if (!sanityUserId) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  let body: { displayName?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const raw = typeof body.displayName === 'string' ? body.displayName.trim() : '';
  if (!NAME_RE.test(raw)) {
    return NextResponse.json(
      { error: 'Display name must be 3 to 20 characters: letters, numbers, underscore, or hyphen.' },
      { status: 400 },
    );
  }

  if (RESERVED.has(raw.toLowerCase())) {
    return NextResponse.json({ error: 'That name is reserved. Pick another.' }, { status: 400 });
  }

  const profanityError = validateText(raw, 'Display name');
  if (profanityError) {
    return NextResponse.json({ error: profanityError }, { status: 400 });
  }

  // Uniqueness check (case-insensitive)
  const existing = await sanityWriteClient.fetch<string | null>(
    `*[_type == "user" && lower(displayName) == $lower && _id != $id][0]._id`,
    { lower: raw.toLowerCase(), id: sanityUserId },
  );
  if (existing) {
    return NextResponse.json({ error: 'That name is already taken.' }, { status: 409 });
  }

  // One-shot: refuse to overwrite an existing displayName for this user.
  const current = await sanityWriteClient.fetch<string | null>(
    `*[_type == "user" && _id == $id][0].displayName`,
    { id: sanityUserId },
  );
  if (current) {
    return NextResponse.json(
      { error: 'Display name already set. Contact support to change it.' },
      { status: 409 },
    );
  }

  await sanityWriteClient.patch(sanityUserId).set({ displayName: raw }).commit();

  return NextResponse.json({ displayName: raw });
}
