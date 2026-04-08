import { defineField, defineType } from 'sanity';

export const user = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'providerId',
      title: 'Provider ID',
      type: 'string',
      description: 'e.g. google:118234... or discord:83729...',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      options: { list: ['google', 'discord'] },
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Display Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'image',
      title: 'Avatar URL',
      type: 'url',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'provider', media: 'image' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Unknown User',
        subtitle: subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : '',
      };
    },
  },
});
