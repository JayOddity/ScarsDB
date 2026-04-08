import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'scarshq',
  title: 'ScarsHQ',
  projectId: 'oazt8hd0',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('article').title('Articles'),
            S.documentTypeListItem('newsPost').title('News'),
            S.documentTypeListItem('page').title('Pages'),
            S.divider(),
            S.documentTypeListItem('item').title('Items'),
            S.documentTypeListItem('talentBuild').title('Talent Builds'),
            S.divider(),
            S.documentTypeListItem('newsletter').title('Newsletter Subscribers'),
            S.divider(),
            S.documentTypeListItem('user').title('Users'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
