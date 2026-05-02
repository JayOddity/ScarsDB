require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

(async () => {
  const builds = await client.fetch(
    `*[_type == "talentBuild" && !defined(isPublic)]{ _id, code, createdAt }`,
  );
  console.log(`Found ${builds.length} builds to backfill.`);

  let done = 0;
  for (const b of builds) {
    await client
      .patch(b._id)
      .set({ isPublic: true, publishedAt: b.createdAt || new Date().toISOString() })
      .commit();
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${builds.length}`);
  }
  console.log(`Done — backfilled ${done} builds.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
