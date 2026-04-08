import { defineField, defineType } from 'sanity';

export const buildVote = defineType({
  name: 'buildVote',
  title: 'Build Vote',
  type: 'document',
  fields: [
    defineField({
      name: 'build',
      title: 'Build',
      type: 'reference',
      to: [{ type: 'talentBuild' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'voterIp',
      title: 'Voter IP',
      type: 'string',
      description: 'IP address for anonymous votes',
    }),
    defineField({
      name: 'vote',
      title: 'Vote',
      type: 'number',
      description: '1 = upvote, -1 = downvote',
      validation: (r) => r.required().min(-1).max(1),
    }),
  ],
  preview: {
    select: { buildCode: 'build.code', userName: 'user.name', vote: 'vote' },
    prepare({ buildCode, userName, vote }) {
      return {
        title: `${userName || 'Unknown'} ${vote === 1 ? '▲' : '▼'} ${buildCode || '???'}`,
      };
    },
  },
});
