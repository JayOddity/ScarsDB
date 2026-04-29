import { defineField, defineType } from 'sanity';

export const spell = defineType({
  name: 'spell',
  title: 'Spell',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 120 },
      description: 'Auto-generated on import. Collisions get a numeric suffix.',
    }),
    defineField({ name: 'patch', title: 'Patch', type: 'string', initialValue: 'Pre Spring Playtest' }),
    defineField({ name: 'externalId', title: 'BeastBurst ID', type: 'string', readOnly: true }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'icon', title: 'Icon URL', type: 'url' }),
    defineField({ name: 'maxRange', title: 'Max Range', type: 'number' }),
    defineField({ name: 'targetType', title: 'Target Type', type: 'string' }),
    defineField({ name: 'channelTime', title: 'Channel Time (ms)', type: 'number' }),
    defineField({ name: 'castTime', title: 'Cast Time (ms)', type: 'number' }),
    defineField({ name: 'cooldown', title: 'Cooldown (ms)', type: 'number' }),
    defineField({ name: 'globalCooldown', title: 'Global Cooldown (ms)', type: 'number' }),
    defineField({ name: 'requiredAmount', title: 'Required Resource Amount', type: 'number' }),
    defineField({ name: 'requiredResource', title: 'Required Resource', type: 'string' }),
    defineField({ name: 'schoolType', title: 'School', type: 'string' }),
    defineField({ name: 'flags', title: 'Flags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'classSpecLevels',
      title: 'Class / Spec / Level Mappings',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'class', title: 'Class', type: 'string' }),
            defineField({ name: 'spec', title: 'Spec', type: 'string' }),
            defineField({ name: 'level', title: 'Level', type: 'number' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'schoolType' },
  },
});
