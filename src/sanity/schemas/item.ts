import { defineField, defineType } from 'sanity';

export const item = defineType({
  name: 'item',
  title: 'Item',
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
    defineField({
      name: 'rarity',
      title: 'Rarity',
      type: 'string',
      options: { list: ['Common', 'Rare', 'Epic', 'Legendary'] },
    }),
    defineField({ name: 'itemType', title: 'Type', type: 'string' }),
    defineField({ name: 'slotType', title: 'Slot', type: 'string' }),
    defineField({ name: 'icon', title: 'Icon URL', type: 'url' }),
    defineField({ name: 'stackSize', title: 'Stack Size', type: 'number' }),
    defineField({ name: 'sellValue', title: 'Sell Value', type: 'number' }),
    defineField({ name: 'isDestructible', title: 'Destructible', type: 'boolean' }),
    defineField({
      name: 'statLists',
      title: 'Stat Pools',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'minStatCount', title: 'Min Stat Count', type: 'number' }),
            defineField({ name: 'maxStatCount', title: 'Max Stat Count', type: 'number' }),
            defineField({
              name: 'modifications',
              title: 'Modifications',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'stat', title: 'Stat Name', type: 'string' }),
                    defineField({ name: 'modifType', title: 'Modifier Type', type: 'string' }),
                    defineField({ name: 'modifWeight', title: 'Weight', type: 'number' }),
                    defineField({ name: 'minValue', title: 'Min Value', type: 'string' }),
                    defineField({ name: 'maxValue', title: 'Max Value', type: 'string' }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'rarity' },
  },
});
