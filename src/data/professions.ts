export interface Profession {
  slug: string;
  name: string;
  icon: string;
  type: 'Gathering' | 'Crafting';
  description: string;
  details: string;
  produces: string[];
  synergies: string[];
}

export const professions: Profession[] = [
  {
    slug: 'mining',
    name: 'Mining',
    icon: '⛏️',
    type: 'Gathering',
    description: 'Extract ores and precious gems from mineral veins found throughout Aragon.',
    details: 'Mining nodes appear in caves, mountains, and rocky terrain. Higher-tier ores require higher skill levels and are found in more dangerous zones. Mining also features a refining minigame where you smelt raw ore into usable ingots.',
    produces: ['Copper Ore', 'Iron Ore', 'Mithril Ore', 'Darksteel Ore', 'Gems', 'Ingots'],
    synergies: ['Blacksmithing', 'Engineering'],
  },
  {
    slug: 'herbalism',
    name: 'Herbalism',
    icon: '🌿',
    type: 'Gathering',
    description: 'Gather herbs, flowers, and fungi from the wilds for use in alchemy and cooking.',
    details: 'Herbs grow in specific biomes — meadow flowers in plains, mushrooms in caves, and rare blossoms in enchanted forests. Some herbs only bloom at certain times of day. Herbalism includes a careful-picking minigame.',
    produces: ['Healing Herbs', 'Mana Blossoms', 'Poison Roots', 'Rare Fungi', 'Enchanted Petals', 'Reagents'],
    synergies: ['Alchemy', 'Cooking'],
  },
  {
    slug: 'skinning',
    name: 'Skinning',
    icon: '🔪',
    type: 'Gathering',
    description: 'Skin defeated beasts and creatures for leather, hides, and exotic materials.',
    details: 'After defeating a beast-type enemy, skinners can harvest leather and other materials. Rarer creatures drop exotic hides used in high-level crafting. The quality of materials depends on the creature level and your skinning skill.',
    produces: ['Light Leather', 'Medium Leather', 'Heavy Leather', 'Exotic Hides', 'Scales', 'Fur'],
    synergies: ['Leatherworking', 'Tailoring'],
  },
  {
    slug: 'woodcutting',
    name: 'Woodcutting',
    icon: '🪓',
    type: 'Gathering',
    description: 'Fell trees and gather wood for construction, crafting, and enchanting.',
    details: 'Trees of various types dot the landscape. Oak and birch are common, while ironwood and eldertree only grow in specific zones. Woodcutting features a rhythmic chopping minigame for bonus yield.',
    produces: ['Oak Wood', 'Birch Planks', 'Ironwood Logs', 'Eldertree Timber', 'Sap', 'Bark'],
    synergies: ['Carpentry', 'Engineering'],
  },
  {
    slug: 'blacksmithing',
    name: 'Blacksmithing',
    icon: '🔨',
    type: 'Crafting',
    description: 'Forge weapons and heavy armor from metal ingots and other materials.',
    details: 'Blacksmiths create plate armor, swords, axes, maces, and shields. The forging process involves a temperature-management minigame where maintaining the right heat produces higher-quality items. Master blacksmiths can add bonus stats.',
    produces: ['Plate Armor', 'Swords', 'Axes', 'Shields', 'Mail Armor', 'Weapon Enhancements'],
    synergies: ['Mining'],
  },
  {
    slug: 'alchemy',
    name: 'Alchemy',
    icon: '⚗️',
    type: 'Crafting',
    description: 'Brew potions, elixirs, and transmute materials using herbs and reagents.',
    details: 'Alchemists create health potions, mana elixirs, buff flasks, and poisons. Advanced alchemy allows transmutation of materials. Brewing involves a mixing minigame where ingredient ratios affect potion quality and duration.',
    produces: ['Health Potions', 'Mana Elixirs', 'Buff Flasks', 'Poisons', 'Transmuted Materials', 'Oils'],
    synergies: ['Herbalism'],
  },
  {
    slug: 'leatherworking',
    name: 'Leatherworking',
    icon: '🧵',
    type: 'Crafting',
    description: 'Craft leather and medium armor, bags, and accessories from hides.',
    details: 'Leatherworkers produce medium armor worn by rangers, assassins, and druids. They also craft bags, belts, and bracers. The tanning process features a stretching minigame that determines flexibility and durability bonuses.',
    produces: ['Leather Armor', 'Cloaks', 'Bags', 'Belts', 'Bracers', 'Quivers'],
    synergies: ['Skinning'],
  },
  {
    slug: 'enchanting',
    name: 'Enchanting',
    icon: '✨',
    type: 'Crafting',
    description: 'Imbue weapons and armor with magical enhancements and disenchant items.',
    details: 'Enchanters add magical properties to equipment — fire damage to swords, frost resistance to armor, etc. They can also disenchant items to recover magical essences. Enchanting involves a rune-tracing minigame for precision.',
    produces: ['Weapon Enchants', 'Armor Enchants', 'Magical Essences', 'Runes', 'Scrolls', 'Gems (socketed)'],
    synergies: ['All crafting professions'],
  },
];
