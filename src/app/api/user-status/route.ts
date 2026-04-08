import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isUserBanned } from '@/lib/bannedUsers';
import { isAdmin } from '@/lib/adminUsers';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;

  if (!userId) {
    return NextResponse.json({ banned: false, loggedIn: false, admin: false });
  }

  return NextResponse.json({
    banned: isUserBanned(userId),
    loggedIn: true,
    admin: isAdmin(userId),
  });
}
