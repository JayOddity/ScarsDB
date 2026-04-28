# ScarsHQ Deployment Checklist

Everything you need to change when going from localhost to production.
Your production URL is assumed to be `https://scars-db.vercel.app` — replace if using a custom domain.

---

## 1. Google OAuth (console.cloud.google.com)

- [ ] Go to **APIs & Services > Credentials** > click your ScarsHQ OAuth client
- [ ] Under **Authorized redirect URIs**, add:
  ```
  https://scars-db.vercel.app/api/auth/callback/google
  ```
- [ ] Go to **OAuth consent screen** > click **"Publish App"**
  - Right now it's in "Testing" mode — only emails you manually add can log in
  - Publishing makes it available to everyone
  - Google may ask you to verify (takes a few days) — for unverified apps, users see a warning but can still proceed

## 2. Discord OAuth (discord.com/developers)

- [ ] Go to your ScarsHQ app > **OAuth2**
- [ ] Under **Redirects**, add:
  ```
  https://scars-db.vercel.app/api/auth/callback/discord
  ```

## 3. Vercel Environment Variables

Go to your Vercel project > **Settings > Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | (copy from .env.local) |
| `AUTH_GOOGLE_ID` | (copy from .env.local) |
| `AUTH_GOOGLE_SECRET` | (copy from .env.local) |
| `AUTH_DISCORD_ID` | (copy from .env.local) |
| `AUTH_DISCORD_SECRET` | (copy from .env.local) |
| `AUTH_TRUST_HOST` | `true` |

The other env vars (Sanity, BeastBurst, CRON_SECRET) should already be set.

## 4. Sanity CORS

- [ ] Go to **sanity.io/manage** > project `oazt8hd0` > **API > CORS origins**
- [ ] Add `https://scars-db.vercel.app` with credentials allowed

## 5. If Using a Custom Domain

If you set up a custom domain (e.g. `scarshq.com`), you need to update:

- [ ] Google OAuth redirect URI → `https://scarshq.com/api/auth/callback/google`
- [ ] Discord OAuth redirect URI → `https://scarshq.com/api/auth/callback/discord`
- [ ] Sanity CORS → add `https://scarshq.com`

Keep the Vercel URL redirects too (both can work at the same time).

---

## Post-Launch TODO (not blocking deploy)

- [ ] **Item detail pages** — redesign `/items/[id]`: better stat layout, rarity colours, icon rendering, overall polish
- [ ] SEO — sitemap.xml, robots.txt, JSON-LD
- [ ] OG images for social sharing
- [ ] Equipment/Skills/Scars/Stats tabs on talent tree (currently placeholder)

---

## Quick Test After Deploy

1. Visit your production URL
2. Click "Sign In" in the header
3. Try Google login — should redirect back to /builds
4. Try Discord login — same
5. Save a talent build — should show your name as author
6. Check /builds "All Builds" tab — your build should appear
