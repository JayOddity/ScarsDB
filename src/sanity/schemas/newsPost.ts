import { defineField, defineType } from 'sanity';

export const newsPost = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'ScarsHQ',
      description: 'Defaults to ScarsHQ. Change for guest posts.',
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'youtubeEmbed' },
      ],
    }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
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
    select: { title: 'title', media: 'featuredImage' },
  },
  orderings: [
    { title: 'Published Date', name: 'publishedAt', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
});
