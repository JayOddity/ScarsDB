export interface DevPost {
  id: string;
  category: string;
  categoryColor: string;
  date: string;
  quote: string;
  author: string;
  title: string;
  source: string;
  sourceUrl: string;
}

export const devPosts: DevPost[] = [
  {
    id: '1',
    category: 'Core Principles',
    categoryColor: '#c8a84e',
    date: '2026-03-15',
    quote: 'We believe that the best MMORPG experience comes from meaningful choices. There are no subclasses in Scars of Honor — your talent tree IS your class. Every point you spend shapes who your character becomes.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'YouTube Dev Stream',
    sourceUrl: 'https://www.youtube.com/@ScarsofHonor',
  },
  {
    id: '2',
    category: 'Playtest',
    categoryColor: '#4a8ff7',
    date: '2026-03-10',
    quote: 'The April playtest will feature 4 classes, 4 races, full talent trees, dungeons in the second content drop, and PvP in the third. We want players to experience the core loop and give us feedback.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'Steam News',
    sourceUrl: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  },
  {
    id: '3',
    category: 'Talents',
    categoryColor: '#a855f7',
    date: '2026-03-05',
    quote: 'Each class has over 240 talent nodes organized into three distinct paths. But here\'s the thing — you\'re not locked into one path. You can mix and match to create truly unique builds.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'YouTube Dev Stream',
    sourceUrl: 'https://www.youtube.com/@ScarsofHonor',
  },
  {
    id: '4',
    category: 'PvP',
    categoryColor: '#c43a3a',
    date: '2026-02-28',
    quote: 'PvP will include open world combat, a 5v5 battleground called Mourning Pass, and Thallan\'s Ring arena with 1v1v1 and 2v2v2 modes. We want PvP to feel meaningful, not just a deathmatch.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'Reddit AMA',
    sourceUrl: 'https://www.reddit.com/r/scarsofhonor/',
  },
  {
    id: '5',
    category: 'Development',
    categoryColor: '#22c55e',
    date: '2026-02-20',
    quote: 'Our art style is evolving. We\'re moving toward a more stylized look that runs well on a wide range of hardware. The goal is PC-first with mobile coming later.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'Steam News',
    sourceUrl: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  },
  {
    id: '6',
    category: 'Development',
    categoryColor: '#22c55e',
    date: '2026-02-15',
    quote: 'The dungeon system will feature modifiers — bonus and penalty effects that change how you approach each run. No two runs should feel exactly the same.',
    author: 'Venelin Vasilev',
    title: 'CEO / Creative Director',
    source: 'YouTube Dev Stream',
    sourceUrl: 'https://www.youtube.com/@ScarsofHonor',
  },
];
