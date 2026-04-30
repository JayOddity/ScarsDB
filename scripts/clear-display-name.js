#!/usr/bin/env node
/**
 * One-off: clear the displayName field on the Sanity user document(s) matching
 * a given email so the onboarding flow can be re-tested.
 *
 * Usage: node scripts/clear-display-name.js <email>
 */
const path = require('node:path');
const fs = require('node:fs');

// Load env from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: node scripts/clear-display-name.js <email>');
    process.exit(1);
  }
  const docs = await client.fetch(
    `*[_type == "user" && lower(email) == $email]{_id, email, displayName, provider, providerAccountId}`,
    { email },
  );
  if (!docs.length) {
    console.log(`No user documents found for ${email}.`);
    return;
  }
  console.log(`Found ${docs.length} user document(s):`);
  for (const d of docs) {
    console.log(`  ${d._id}  provider=${d.provider}  displayName=${JSON.stringify(d.displayName)}`);
  }
  // Use direct per-document patch — the transaction-functional form is brittle
  // across SDK versions and silently no-ops on some builds.
  for (const d of docs) {
    const result = await client.patch(d._id).unset(['displayName']).commit();
    console.log(`  cleared ${result._id} -> displayName=${JSON.stringify(result.displayName)}`);
  }
})().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
