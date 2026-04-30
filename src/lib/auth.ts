import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Twitch from 'next-auth/providers/twitch';
import { sanityClient, sanityWriteClient } from './sanity';

// Used by Discord/Twitch flows to auto-claim a displayName from the OAuth
// username so users skip the manual onboarding step entirely.
const NAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const RESERVED = new Set([
  'admin', 'administrator', 'mod', 'moderator', 'staff', 'system',
  'scarshq', 'scars', 'support', 'help', 'official', 'team',
  'anonymous', 'anon', 'null', 'undefined', 'guest', 'user',
  'root', 'owner', 'dev', 'developer', 'bot',
]);

function sanitizeOauthUsername(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (cleaned.length < 3) return null;
  return cleaned.slice(0, 20);
}

async function pickAvailableDisplayName(seed: string, ownerId: string): Promise<string | null> {
  const baseAttempt = sanitizeOauthUsername(seed);
  if (!baseAttempt) return null;
  const attempts: string[] = [];
  if (NAME_RE.test(baseAttempt) && !RESERVED.has(baseAttempt.toLowerCase())) {
    attempts.push(baseAttempt);
  }
  const trunkLen = Math.max(3, Math.min(baseAttempt.length, 16));
  const trunk = baseAttempt.slice(0, trunkLen);
  for (let i = 1; i < 50 && attempts.length < 50; i++) {
    const candidate = `${trunk}_${i}`.slice(0, 20);
    if (NAME_RE.test(candidate) && !RESERVED.has(candidate.toLowerCase())) {
      attempts.push(candidate);
    }
  }
  for (const name of attempts) {
    const taken = await sanityWriteClient.fetch<string | null>(
      `*[_type == "user" && lower(displayName) == $lower && _id != $id][0]._id`,
      { lower: name.toLowerCase(), id: ownerId },
    );
    if (!taken) return name;
  }
  return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord, Twitch],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;
      const sanityId = `user-${account.provider}-${account.providerAccountId}`;
      try {
        await sanityWriteClient.createIfNotExists({
          _type: 'user',
          _id: sanityId,
          providerId: `${account.provider}:${account.providerAccountId}`,
          provider: account.provider,
          name: user.name || 'Unknown',
          email: user.email || '',
          image: user.image || '',
          createdAt: new Date().toISOString(),
        });
        await sanityWriteClient
          .patch(sanityId)
          .set({ name: user.name || 'Unknown', image: user.image || '' })
          .commit();
        // Discord and Twitch get their displayName auto-claimed from the OAuth
        // username so they never need to visit /onboarding.
        if (account.provider === 'discord' || account.provider === 'twitch') {
          const current = await sanityWriteClient.fetch<string | null>(
            `*[_type == "user" && _id == $id][0].displayName`,
            { id: sanityId },
          );
          if (!current) {
            const seed = String(user.name || '').trim();
            const claimed = await pickAvailableDisplayName(seed, sanityId);
            if (claimed) {
              await sanityWriteClient.patch(sanityId).set({ displayName: claimed }).commit();
            }
          }
        }
      } catch {
        // Don't block login if Sanity write fails
      }
      return true;
    },
    async jwt({ token, account, trigger }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.sanityUserId = `user-${account.provider}-${account.providerAccountId}`;
      }
      if ((account || trigger === 'update') && token.sanityUserId) {
        try {
          const dn = await sanityClient.fetch<string | null>(
            `*[_type == "user" && _id == $id][0].displayName`,
            { id: token.sanityUserId },
          );
          token.displayName = dn || null;
        } catch {
          token.displayName = token.displayName ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).sanityUserId = token.sanityUserId;
        (session.user as unknown as Record<string, unknown>).provider = token.provider;
        (session.user as unknown as Record<string, unknown>).displayName = token.displayName ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
