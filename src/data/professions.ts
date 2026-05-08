export interface ProfessionMaterial {
  name: string;
  icon: string;
  slug?: string;
}

export interface Profession {
  slug: string;
  name: string;
  type: 'Gathering' | 'Crafting';
  description: string;
  details: string;
  icon: string;
  produces: string[];
  sampleMaterials: ProfessionMaterial[];
  synergies: string[];
  station?: string;
  tool?: string;
}

// Sourced from the Spring 2026 playtest client (datamined localization,
// InteractableViewTable, TooltipTable, CraftingTable, MiniGameTable, Items,
// IconsDatabase). Five gathering professions each have their own tool slot;
// three crafting actions (Craft, Cook, Brew) run at three station types
// (Forge, Cauldron, Alchemy Stand).

const ICONS = '/Icons/Professions';
const MATS = '/Icons/Professions/materials';

export const professions: Profession[] = [
  {
    slug: 'mining',
    name: 'Mining',
    type: 'Gathering',
    description: 'Strike ores and gems out of veins scattered across the world.',
    details:
      "Veins spawn in four sizes (Small, Medium, Large, Massive) and have a Vein Integrity bar that drops with each hit. Press E or right click to mine. Tools are pickaxes across ten tiers, from the Scout's Pickaxe up to the Draketalon Pickaxe.",
    icon: `${ICONS}/mining.png`,
    tool: 'Pickaxe',
    produces: [
      'Copper Ore',
      'Iron Ore',
      'Cobalt Ore',
      'Adamantite Ore',
      'Diamond Ore',
      'Meteorite Ore',
      'Obsidian Ore',
      'Azure Moonstone',
      'Black Tourmaline',
      'Cateye Stone',
    ],
    sampleMaterials: [
      { name: 'Copper Ore', icon: `${MATS}/copper-ore.png`, slug: 'Copper-Ore' },
      { name: 'Iron Ore', icon: `${MATS}/iron-ore.png`, slug: 'Iron-Ore' },
      { name: 'Cobalt Ore', icon: `${MATS}/cobalt-ore.png`, slug: 'Cobalt-Ore' },
      { name: 'Iron Ingot', icon: `${MATS}/iron-ingot.png`, slug: 'Iron-Ingot' },
    ],
    synergies: ['Blacksmithing'],
  },
  {
    slug: 'woodcutting',
    name: 'Woodcutting',
    type: 'Gathering',
    description: 'Fell trees for the wood used in weapons, bows, and structures.',
    details:
      'Trees have a Tree Integrity bar. Hold and release the action button to chop, with the timing of the release affecting the hit. Tree species in the playtest include Glowtree, Brownhorn, Oaknoar, Glassfir, Cronetree, Needletree, Ashtree, Spiketree, Skybirch, and the Draconic Tree, with Massive variants of each.',
    icon: `${ICONS}/woodcutting.png`,
    tool: 'Axe',
    produces: [
      'Lightwood',
      'Finewood',
      'Darkwood',
      'Crystalwood',
      'Swampwood',
      'Frostwood',
      'Flamewood',
      'Steelwood',
      'Diamondwood',
      'Dragonwood',
    ],
    sampleMaterials: [
      { name: 'Lightwood', icon: `${MATS}/wood-tier1.png`, slug: 'Lightwood' },
      { name: 'Finewood', icon: `${MATS}/wood-tier2.png`, slug: 'Finewood' },
      { name: 'Darkwood', icon: `${MATS}/wood-tier3.png`, slug: 'Darkwood' },
      { name: 'Hardwood Plank', icon: `${MATS}/hardwood-plank.png`, slug: 'Hardwood-Plank' },
    ],
    synergies: ['Blacksmithing'],
  },
  {
    slug: 'herbalism',
    name: 'Herbalism',
    type: 'Gathering',
    description: 'Pick herbs, fungi, and other plants used in alchemy and cooking.',
    details:
      'Herbs are world objects you interact with directly. Confirmed plants include Silverflower, Ghostleaf, Stenchflower, Black Thyme, Glowfruit, Glowseed, and Silverseed. The internal engine name is Gardening, but the UI and tool slot label it Herbalism.',
    icon: `${ICONS}/herbalism.png`,
    produces: [
      'Silverflower',
      'Ghostleaf',
      'Stenchflower',
      'Black Thyme',
      'Glowfruit',
      'Glowseed',
      'Silverseed',
    ],
    sampleMaterials: [
      { name: 'Black Thyme', icon: `${MATS}/black-thyme.png`, slug: 'Black-Thyme' },
      { name: 'Ghostleaf', icon: `${MATS}/ghostleaf.png`, slug: 'Ghostleaf' },
      { name: 'Stenchflower', icon: `${MATS}/stenchflower.png`, slug: 'Stenchflower' },
      { name: 'Silverseed', icon: `${MATS}/silverseed.png`, slug: 'Silverseed' },
    ],
    synergies: ['Alchemy', 'Cooking'],
  },
  {
    slug: 'carving',
    name: 'Carving',
    type: 'Gathering',
    description: 'Harvest pelts, bones, and other materials from defeated creatures.',
    details:
      'Carving is the in game name for what other MMOs call skinning. After killing the right kind of beast you can take its hides and bones. Materials seen in the playtest include Gorejaw Pelt, Thick Leather Scraps, Small and Big Skeleton Bones, Bone Marrow, and Resin. Has its own dedicated tool slot.',
    icon: `${ICONS}/carving.png`,
    produces: [
      'Gorejaw Pelt',
      'Thick Leather Scraps',
      'Small Skeleton Bone',
      'Big Skeleton Bone',
      'Bone Marrow',
      'Resin',
    ],
    sampleMaterials: [
      { name: 'Soft Skin', icon: `${MATS}/soft-skin.png`, slug: 'Soft-Skin' },
      { name: 'Hard Skin', icon: `${MATS}/hard-skin.png`, slug: 'Hard-Skin' },
      { name: 'Bone Marrow', icon: `${MATS}/bone-marrow.png`, slug: 'Bone-Marrow' },
      { name: 'Resin', icon: `${MATS}/resin.png`, slug: 'Resin' },
    ],
    synergies: ['Blacksmithing', 'Alchemy'],
  },
  {
    slug: 'fishing',
    name: 'Fishing',
    type: 'Gathering',
    description: 'Catch fish from spots along rivers, lakes, and coasts.',
    details:
      "Fishing spots come in four sizes (Small, Medium, Large, Monstrous) and ten tiers from Greyfish up to T10. The minigame asks you to track the fish's movement and a Fish Strength bar through the round. Harpoons are the tool, from Makeshift Harpoon up to Draketalon Harpoon.",
    icon: `${ICONS}/fishing.png`,
    tool: 'Harpoon',
    produces: [
      'Grey Fish Meat',
      'White Fish Meat',
      'Red Fish Meat',
      'Fatty Fish Meat',
      'Frostcut Meat',
      'Goldenstrips',
      'Glassflesh',
      'Blackfin Meat',
      'Glowmeat',
      'Starfillet',
      'Pearl',
      'Fish Scales',
    ],
    sampleMaterials: [
      { name: 'Grey Fish Meat', icon: `${MATS}/fish-meat-1.png`, slug: 'Grey-Fish-Meat' },
      { name: 'White Fish Meat', icon: `${MATS}/fish-meat-2.png`, slug: 'White-Fish-Meat' },
      { name: 'Pearl', icon: `${MATS}/pearl.png`, slug: 'Pearl' },
      { name: 'Fish Scales', icon: `${MATS}/fish-scales.png`, slug: 'Fish-Scales' },
    ],
    synergies: ['Cooking'],
  },
  {
    slug: 'blacksmithing',
    name: 'Blacksmithing',
    type: 'Crafting',
    description: 'Forge weapons, armor, sidearms, and tools at a forge.',
    details:
      'Forges appear in three grades: Village Forge, Town Forge, and Military Forge. The action prompt is "Press E or right click to forge." Recipes are sorted into Weapons, Armor, Sidearms, Tools, and Miscs with difficulty ratings of Easy, Moderate, Challenging, Difficult, and Formidable. Common, Rare, Epic, and Legendary outputs can roll Masterwork Bonuses, Set Bonuses, and Soulbinding.',
    icon: `${ICONS}/blacksmithing.png`,
    station: 'Forge',
    produces: [
      'Swords',
      'Axes',
      'Hammers',
      'Daggers',
      'Bows',
      'Crossbows',
      'Spears',
      'Plate Armor',
      'Shields',
      'Tools',
    ],
    sampleMaterials: [
      { name: 'Longsword', icon: `${MATS}/sword.png`, slug: 'Longsword' },
      { name: 'Stonegrip', icon: `${MATS}/greatsword.png`, slug: 'Stonegrip' },
      { name: 'Worn Longbow', icon: `${MATS}/bow.png`, slug: 'Worn-Longbow' },
      { name: 'Vowguard', icon: `${MATS}/shield.png`, slug: 'Vowguard' },
    ],
    synergies: ['Mining', 'Woodcutting', 'Carving'],
  },
  {
    slug: 'cooking',
    name: 'Cooking',
    type: 'Crafting',
    description: 'Cook food at a cauldron using a temperature timing minigame.',
    details:
      'Add ingredients in the right order at the required temperature. The heat bar runs from Cold, Warm, Hot, Very hot, to Searing. Each recipe needs a set amount of fuel to start and the heat ticks down between actions. The station is a Cauldron and the prompt to add fuel is "Press E or right click to increase heat."',
    icon: `${ICONS}/cooking.png`,
    station: 'Cauldron',
    produces: ['Cooked Fish', 'Meat Dishes', 'Stews', 'Buff Foods'],
    sampleMaterials: [
      { name: 'Boiled Potatoes', icon: `${MATS}/potatoes-boiled.png`, slug: 'Boiled-Potatoes' },
      { name: 'Beefy Meat Stew', icon: `${MATS}/beefy-meat-stew.png`, slug: 'Beefy-Meat-Stew' },
      { name: 'Grey Fish Stew', icon: `${MATS}/grey-fish-stew.png`, slug: 'Grey-Fish-Stew' },
      { name: "Pirate's Stew", icon: `${MATS}/pirates-stew.png`, slug: 'Pirates-Stew' },
    ],
    synergies: ['Fishing', 'Herbalism', 'Carving'],
  },
  {
    slug: 'alchemy',
    name: 'Alchemy',
    type: 'Crafting',
    description: 'Brew potions and elixirs at an alchemy stand.',
    details:
      'Stations come in grades, including the Rickety Alchemy Stand and the Ordinary Alchemy Stand. The action button is labelled "Brew." Recipes seen in the playtest include Healing Potions, Power Potions, Lightfeet, Fury, and Barkskin, each available in Potent, Strong, and Divine variants. Higher rarity recipes can roll Masterwork Bonuses and Set Bonuses.',
    icon: `${ICONS}/alchemy.png`,
    station: 'Alchemy Stand',
    produces: [
      'Healing Potion',
      'Power Potion',
      'Fury Potion',
      'Lightfeet Potion',
      'Barkskin Potion',
    ],
    sampleMaterials: [
      { name: 'Healing Potion', icon: `${MATS}/healing-potion.png`, slug: 'Healing-Potion' },
      { name: 'Fury Potion', icon: `${MATS}/fury-potion.png`, slug: 'Fury-Potion' },
      { name: 'Lightfeet Potion', icon: `${MATS}/lightfeet-potion.png`, slug: 'Lightfeet-Potion' },
      { name: 'Barkskin Potion', icon: `${MATS}/barkskin-potion.png`, slug: 'Barkskin-Potion' },
    ],
    synergies: ['Herbalism'],
  },
];
