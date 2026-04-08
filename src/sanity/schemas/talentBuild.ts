import { defineField, defineType } from 'sanity';

export const talentBuild = defineType({
  name: 'talentBuild',
  title: 'Talent Build',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Short Code',
      type: 'string',
      validation: (r) => r.required().min(6).max(8),
      readOnly: true,
    }),
    defineField({
      name: 'classSlug',
      title: 'Class',
      type: 'string',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'allocation',
      title: 'Allocation String',
      type: 'string',
      description: 'Format: nodeId:rank,nodeId:rank,...',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Build Name',
      type: 'string',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'PvP', value: 'pvp' },
          { title: 'PvE', value: 'pve' },
          { title: 'Leveling', value: 'leveling' },
          { title: 'Beginner', value: 'beginner' },
        ],
      },
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy', value: 'easy' },
          { title: 'Medium', value: 'medium' },
          { title: 'Hard', value: 'hard' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief summary shown in build lists (max 500 chars)',
    }),
    defineField({
      name: 'guide',
      title: 'Full Guide',
      type: 'text',
      description: 'Full written guide in Markdown format. No character limit.',
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment',
      type: 'text',
      description: 'JSON string mapping slot keys to item IDs, e.g. {"Helmet":"item-123","Boots":"item-456"}',
    }),
    defineField({
      name: 'patch',
      title: 'Patch / Version',
      type: 'string',
      description: 'Game patch this build was created for, e.g. "Pre-Alpha", "Spring 2026 Playtest"',
    }),
    defineField({
      name: 'totalPoints',
      title: 'Total Points',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'upvotes',
      title: 'Upvotes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'downvotes',
      title: 'Downvotes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'classSlug', code: 'code' },
    prepare({ title, subtitle, code }) {
      return {
        title: title || code || 'Unnamed Build',
        subtitle: `${subtitle} - ${code}`,
      };
    },
  },
});
