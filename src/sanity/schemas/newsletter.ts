import { defineField, defineType } from 'sanity';

export const newsletter = defineType({
  name: 'newsletter',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) =>
        r
          .required()
          .email()
          .error('A valid email address is required'),
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'subscribedAt' },
  },
  orderings: [
    {
      title: 'Subscribed Date',
      name: 'subscribedAt',
      by: [{ field: 'subscribedAt', direction: 'desc' }],
    },
  ],
});
