#!/usr/bin/env node
// Diagnostic: print every user document whose displayName matches (case-insensitive),
// plus the document for a given email, to see why a name might be blocked.
const path = require('node:path');
const fs = require('node:fs');
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
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
  const name = (process.argv[2] || '').trim().toLowerCase();
  const email = (process.argv[3] || '').trim().toLowerCase();
  if (name) {
    const matches = await client.fetch(
      `*[_type == "user" && lower(displayName) == $name]{_id, email, displayName, provider}`,
      { name },
    );
    console.log(`Documents with displayName lower-case '${name}': ${matches.length}`);
    for (const d of matches) console.log(' ', d);
  }
  if (email) {
    const docs = await client.fetch(
      `*[_type == "user" && lower(email) == $email]{_id, email, displayName, provider}`,
      { email },
    );
    console.log(`\nDocuments for email '${email}': ${docs.length}`);
    for (const d of docs) console.log(' ', d);
  }
})().catch((e) => { console.error(e); process.exit(1); });
