import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', title: 'Site Name', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Site Description', type: 'text', rows: 2 }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Default Meta Title', type: 'string' }),
        defineField({ name: 'metaDescription', title: 'Default Meta Description', type: 'text', rows: 2 }),
        defineField({ name: 'ogImage', title: 'Default Social Image', type: 'image' }),
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'discord', title: 'Discord URL', type: 'url' }),
        defineField({ name: 'twitter', title: 'Twitter/X URL', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube URL', type: 'url' }),
      ],
    }),
  ],
});
