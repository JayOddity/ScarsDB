import { defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
      description: 'URL path — e.g. "about" becomes /pages/about',
    }),
    defineField({ name: 'excerpt', title: 'Short Description', type: 'text', rows: 2 }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Keep under 60 characters' }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'Keep under 160 characters' }),
        defineField({ name: 'ogImage', title: 'Social Share Image', type: 'image' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
});
