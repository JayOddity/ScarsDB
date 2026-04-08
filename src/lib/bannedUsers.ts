/**
 * Banned users loaded from BANNED_USERS env var.
 * Format: comma-separated user IDs, e.g. "google-123456,discord-789012"
 * Set in .env.local or Vercel env vars. No redeploy needed on Vercel if using runtime env.
 */

let bannedSet: Set<string> | null = null;

function loadBannedUsers(): Set<string> {
  if (bannedSet) return bannedSet;

  const raw = process.env.BANNED_USERS || '';
  bannedSet = new Set(
    raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  );

  return bannedSet;
}

/**
 * Force reload on next check (useful if env vars change at runtime).
 */
export function clearBanCache(): void {
  bannedSet = null;
}

/**
 * Check if a Sanity user ID is banned.
 * User IDs are in format: user-{provider}-{providerAccountId}
 * Env var stores: {provider}-{providerAccountId}
 */
export function isUserBanned(sanityUserId: string | undefined | null): boolean {
  if (!sanityUserId) return false;
  const banned = loadBannedUsers();
  // Sanity user ID format: user-google-123456 → strip "user-" prefix
  const shortId = sanityUserId.startsWith('user-') ? sanityUserId.slice(5) : sanityUserId;
  return banned.has(shortId) || banned.has(sanityUserId);
}
