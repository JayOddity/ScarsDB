import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Discord from 'next-auth/providers/discord';
import { sanityWriteClient } from './sanity';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Discord],
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
        // Update name/image on subsequent logins
        await sanityWriteClient
          .patch(sanityId)
          .set({ name: user.name || 'Unknown', image: user.image || '' })
          .commit();
      } catch {
        // Don't block login if Sanity write fails
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.sanityUserId = `user-${account.provider}-${account.providerAccountId}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).sanityUserId = token.sanityUserId;
        (session.user as unknown as Record<string, unknown>).provider = token.provider;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
