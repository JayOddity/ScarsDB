import { defineField, defineType } from 'sanity';

export const youtubeEmbed = defineType({
  name: 'youtubeEmbed',
  title: 'YouTube Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste the full URL: https://www.youtube.com/watch?v=... or https://youtu.be/...',
      validation: (r) =>
        r
          .required()
          .uri({ scheme: ['http', 'https'] })
          .custom((value) => {
            if (!value) return true;
            const ok = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(value);
            return ok || 'Must be a YouTube URL';
          }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    }),
  ],
  preview: {
    select: { url: 'url', caption: 'caption' },
    prepare({ url, caption }) {
      return { title: caption || 'YouTube Video', subtitle: url };
    },
  },
});
