import { NextRequest, NextResponse } from 'next/server';
import { sanityClient, sanityWriteClient } from '@/lib/sanity';
import { checkRateLimit } from '@/lib/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { allowed, remaining } = checkRateLimit(ip, 5, 3600000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 5 signups per hour.' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Check for duplicate
    const existing = await sanityClient.fetch<string | null>(
      `*[_type == "newsletter" && email == $email][0]._id`,
      { email: trimmedEmail },
    );

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 },
      );
    }

    await sanityWriteClient.create({
      _type: 'newsletter',
      email: trimmedEmail,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe', details: String(error) },
      { status: 500 },
    );
  }
}
