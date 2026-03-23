import { defineField, defineType } from 'sanity';

export const item = defineType({
  name: 'item',
  title: 'Item',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
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
      name: 'stats',
      title: 'Stats',
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
  preview: {
    select: { title: 'name', subtitle: 'rarity' },
  },
});
