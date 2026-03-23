export interface Mount {
  name: string;
  icon: string;
  type: string;
  speed: string;
  source: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  faction?: string;
}

export const mounts: Mount[] = [
  {
    name: 'Warhorse',
    icon: '🐴',
    type: 'Ground',
    speed: '+60%',
    source: 'Vendor (Level 20)',
    rarity: 'Common',
    description: 'A sturdy warhorse bred for battle. The standard mount for adventurers of The Sacred Order.',
    faction: 'Sacred Order',
  },
  {
    name: 'Dire Wolf',
    icon: '🐺',
    type: 'Ground',
    speed: '+60%',
    source: 'Vendor (Level 20)',
    rarity: 'Common',
    description: 'A fearsome dire wolf tamed by The Domination. Fast and intimidating on the battlefield.',
    faction: 'Domination',
  },
  {
    name: 'Armored Destrier',
    icon: '🐎',
    type: 'Ground',
    speed: '+100%',
    source: 'Vendor (Level 40)',
    rarity: 'Rare',
    description: 'A heavily armored warhorse with barding. Faster and more resilient than standard mounts.',
    faction: 'Sacred Order',
  },
  {
    name: 'Shadow Stalker',
    icon: '🐆',
    type: 'Ground',
    speed: '+100%',
    source: 'Vendor (Level 40)',
    rarity: 'Rare',
    description: 'A shadowy panther-like beast that moves silently through the night. Favored by Domination scouts.',
    faction: 'Domination',
  },
  {
    name: 'Gryphon',
    icon: '🦅',
    type: 'Flying',
    speed: '+150%',
    source: 'Reputation (Skyrider\'s Guild)',
    rarity: 'Epic',
    description: 'A majestic gryphon capable of flight. Soar above the lands of Aragon with unmatched freedom.',
  },
  {
    name: 'Wyvern',
    icon: '🐉',
    type: 'Flying',
    speed: '+150%',
    source: 'Reputation (Domination War Council)',
    rarity: 'Epic',
    description: 'A venomous wyvern that rules the skies. Its screech strikes fear into all who hear it.',
    faction: 'Domination',
  },
  {
    name: 'Spectral Charger',
    icon: '👻',
    type: 'Ground',
    speed: '+100%',
    source: 'Dungeon Drop (Crypt of the Fallen)',
    rarity: 'Epic',
    description: 'A ghostly horse that phases through obstacles. Drops from the final boss of the Crypt of the Fallen.',
  },
  {
    name: 'Magma Tortoise',
    icon: '🐢',
    type: 'Ground',
    speed: '+40%',
    source: 'Achievement (Explore All Zones)',
    rarity: 'Rare',
    description: 'Slow but incredibly sturdy. This volcanic tortoise is immune to dismount effects. A true collector\'s mount.',
  },
  {
    name: 'Phoenix',
    icon: '🔥',
    type: 'Flying',
    speed: '+200%',
    source: 'World Boss (Ash\'kara the Eternal)',
    rarity: 'Legendary',
    description: 'A blazing phoenix reborn from flame. The rarest and fastest mount in Aragon. Only the most dedicated will earn this.',
  },
  {
    name: 'Void Serpent',
    icon: '🐍',
    type: 'Flying',
    speed: '+200%',
    source: 'PvP Season 1 Reward',
    rarity: 'Legendary',
    description: 'A serpentine creature from the void between worlds. Awarded to the top PvP competitors of each season.',
  },
  {
    name: 'Mechanical Spider',
    icon: '🕷️',
    type: 'Ground',
    speed: '+80%',
    source: 'Engineering (Master)',
    rarity: 'Rare',
    description: 'A clockwork arachnid built by master engineers. Can climb steep terrain that other mounts cannot.',
  },
  {
    name: 'Crystal Stag',
    icon: '🦌',
    type: 'Ground',
    speed: '+100%',
    source: 'World Event (Moonlit Hunt)',
    rarity: 'Epic',
    description: 'A mystical stag with crystalline antlers that glow in moonlight. Only appears during the Moonlit Hunt event.',
  },
];
