export interface Subclass {
  name: string;
}

export interface GameClass {
  slug: string;
  name: string;
  icon: string;
  subtitle: string;
  description: string;
  subclasses: Subclass[];
}

export const classes: GameClass[] = [
  {
    slug: 'warrior',
    name: 'Warrior',
    icon: '/Icons/Class%20Icons/official/warrior.png',
    subtitle: 'Frontline Fighter',
    description: 'The backbone of every army, Warriors are disciplined melee fighters built to endure the chaos of battle. Versatile with weapons and resilient in close combat, they thrive on the front lines, taking and dealing heavy damage in equal measure. Whether as a seasoned Pathfinder, a stalwart Vanguard, or a relentless Berserker, Warriors embody strength, discipline, and unyielding resolve.',
    subclasses: [
      { name: 'Pathfinder' },
      { name: 'Vanguard' },
      { name: 'Berserker' },
    ],
  },
  {
    slug: 'paladin',
    name: 'Paladin',
    icon: '/Icons/Class%20Icons/official/paladin.png',
    subtitle: 'Frontline Holy Fighter',
    description: 'Steadfast and unyielding, the Paladin endures on the front lines, wielding holy power and fire to strike down foes while sustaining themselves in battle. Whether as a zealous Inquisitor, a protective Templar, or an inspiring Justicar, Paladins embody faith, resilience, and unbreakable conviction.',
    subclasses: [
      { name: 'Inquisitor' },
      { name: 'Templar' },
      { name: 'Justicar' },
    ],
  },
  {
    slug: 'mage',
    name: 'Mage',
    icon: '/Icons/Class%20Icons/official/mage.png',
    subtitle: 'Ranged Damage Dealer',
    description: 'Masters of the arcane, Mages wield fire, lightning, ice, and cosmic power to devastate enemies from afar. Fragile but unmatched in destructive potential, they control the battlefield through raw damage, crowd control, and mobility. Whether as a resilient Battle Mage, a versatile Runeweaver, or a long-range Wizard, Mages embody the deadly art of disciplined spellcraft.',
    subclasses: [
      { name: 'Battle Mage' },
      { name: 'Runeweaver' },
      { name: 'Wizard' },
    ],
  },
  {
    slug: 'priest',
    name: 'Priest',
    icon: '/Icons/Class%20Icons/official/priest.png',
    subtitle: 'Healer, Damage Dealer',
    description: 'Devout and unwavering, Priests channel divine power to heal allies, shield the faithful, and smite their enemies with holy wrath. Stronger when their faith is tested, they stand as both protectors and punishers on the battlefield. Whether as a blessing Cleric, a god-empowered Worshipper, or a relentless Exorcist, Priests embody devotion, discipline, and divine retribution.',
    subclasses: [
      { name: 'Cleric' },
      { name: 'Worshipper' },
      { name: 'Exorcist' },
    ],
  },
  {
    slug: 'ranger',
    name: 'Ranger',
    icon: '/Icons/Class%20Icons/official/ranger.png',
    subtitle: 'Ranged Damage Dealer',
    description: 'Swift and deadly, Rangers strike from afar with precision shots, elemental power, and clever traps, cutting down foes before they reach the front lines. Fragile but highly mobile, they excel at sustained damage and battlefield control. Whether as a long-range Sharpshooter, a cunning Trapper, or an inventive Artificier, Rangers embody agility, ingenuity, and lethal aim.',
    subclasses: [
      { name: 'Sharpshooter' },
      { name: 'Trapper' },
      { name: 'Artificier' },
    ],
  },
  {
    slug: 'druid',
    name: 'Druid',
    icon: '/Icons/Class%20Icons/official/druid.png',
    subtitle: 'Summoner, Shapeshifter',
    description: 'Druids channel the raw balance of nature, summoning beasts, healing allies, and shifting forms to strike with elemental fury or primal strength. Whether as a prophetic Oracle, a beast-leading Beastmaster, or a versatile Shapeshifter, Druids embody the wild\'s harmony of nurture and ferocity.',
    subclasses: [
      { name: 'Oracle' },
      { name: 'Beastmaster' },
      { name: 'Shapeshifter' },
    ],
  },
  {
    slug: 'assassin',
    name: 'Assassin',
    icon: '/Icons/Class%20Icons/official/assassin.png',
    subtitle: 'Mobile, Finesse Fighter',
    description: 'Swift and lethal, the Assassin trades resilience for speed, striking with blades, poison, or lightning before slipping back into the shadows. Whether as a relentless Bladedancer, a mage-slaying Spellbane, or a solitary Bounty Hunter, Assassins embody precision, cunning, and decisive execution.',
    subclasses: [
      { name: 'Bladedancer' },
      { name: 'Spellbane' },
      { name: 'Bounty Hunter' },
    ],
  },
  {
    slug: 'necromancer',
    name: 'Necromancer',
    icon: '/Icons/Class%20Icons/official/necromancer.png',
    subtitle: 'Spirit Fighter, Caster',
    description: 'Masters of forbidden arts, Necromancers command the dead and wield elemental, spiritual, and cosmic powers at a terrible price. Twisting life and death itself, they summon servants, drain vitality, and spread decay in service to the Doomfather. Whether as a shielded Voidlord, an army-raising Lich, or a blood-fueled Blood Mage, Necromancers embody corruption, sacrifice, and relentless domination.',
    subclasses: [
      { name: 'Voidlord' },
      { name: 'Lich' },
      { name: 'Blood Mage' },
    ],
  },
  {
    slug: 'pirate',
    name: 'Pirate',
    icon: '/Icons/Class%20Icons/official/pirate.png',
    subtitle: 'Melee & Ranged Hybrid',
    description: 'Unpredictable and versatile, Pirates fight with blades, pistols, and cunning tricks, supported by their loyal parrots and a taste for poison and plunder. Dangerous in both close and mid-range combat, they overwhelm enemies with ruthless strikes and relentless pressure. Whether as a dueling Swashbuckler, an oath-broken Cursed, or a firepower-driven Cannoneer, Pirates embody chaos, greed, and deadly adaptability.',
    subclasses: [
      { name: 'Swashbuckler' },
      { name: 'Cursed' },
      { name: 'Cannoneer' },
    ],
  },
  {
    slug: 'mystic',
    name: 'Mystic',
    icon: '/Icons/Class%20Icons/official/mystic.png',
    subtitle: 'Debuffer, Damage Dealer',
    description: 'Wielders of forbidden arts, Mystics spread curses, plagues, and spiritual afflictions to weaken and destroy their foes. Masters of control and damage over time, they embody the darker side of magic - draining strength and sowing despair. Whether as a star-forged Celestial, a poison-weaving Plague Doctor, or a curse-driven Acolyte, Mystics bring inevitable ruin to the battlefield.',
    subclasses: [
      { name: 'Celestial' },
      { name: 'Plague Doctor' },
      { name: 'Acolyte' },
    ],
  },
];

export interface Race {
  slug: string;
  name: string;
  faction: 'sacred-order' | 'domination';
  tagline: string;
  description: string;
  history: string;
  image: string;
  banner: string;
  availableClasses: string[];
}

export interface Faction {
  name: string;
  icon: string;
  summary: string;
  lore: string[];
  races: Race[];
}

export const factions: { sacredOrder: Faction; domination: Faction } = {
  sacredOrder: {
    name: 'The Sacred Order',
    icon: '/Icons/Factions/sacred-order.webp',
    summary: 'Humans, Elves, Dwarves, and Bearans united under the Gods of Order. Bound by faith, brotherhood, and the pursuit of peace.',
    lore: [
      'After the fall of the Great Human Empire, the survivors fled to the continent Irongarth - the last bastion of humankind. From the shared losses of every race, a new alliance rose to stand for Order. In the darkest hours, unexpected heroes emerged: King Venuin\'s diplomacy united powerful allies - the masterful Dwarves, the nature-bound and unmatched assassins of the Sun Elves, and the fierce, loyal Bearans. Together, these four races forged the Sacred Order to defend their new homeland. Their mission: to pursue peace, justice, and equality, and to strengthen the forces of Order - the very power of life and growth. United, they rose to halt the spread of Chaos and to resist the Domination already pressing at Ondal\'s Gate.',
      'But now, another threat awakens: the Ice Dragon. Not merely an enemy of peace, he is an abomination against everything the Sacred Order believes in - the embodiment of ancient chaos, a blight upon the balance of the world itself. By light and by faith, the Sacred Order will rise. The dawn does not kneel.',
    ],
    races: [
      {
        slug: 'human',
        name: 'Human',
        faction: 'sacred-order',
        image: '/Icons/Races/human.webp',
        banner: '/Icons/Races/banner-human.webp',
        tagline: 'Children of the Order',
        description: 'Bold and brave, the Humans compensate for their physical weakness with high spirits, sharp minds, and noble souls, as well as mastery of weapons and fierce battle prowess. They never give up, holding on to hope until their last breath.',
        history: 'The Humans were born under the shadow of the soul-leeching Infernal Demons but never succumbed to fear or despair. Gifted with an unmatched will to live and proud to be champions of the Gods of Order, they built the Great Human Empire under the guidance of the Sun God, Thallan. Other races served them: the mighty Bearans, the skillful Dwarves, the proud green Treants, and the rogue Gronthar. Together, they fought in the Holy Demonic Wars against the common enemy and would have triumphed if not for the Soul Ring, forged by the King of the Infernal Demons, which unleashed a deadly spell that claimed millions of souls and left the continent lifeless. The refugees fled to Irongarth, the final bastion of humankind. In the darkest hour, a new hero emerged: King Venuin Stonehill founded a new kingdom from the ashes, choosing the beautiful Whitesong City as its capital. There, he laid the foundation of the Sacred Order, giving birth to a new era for the Humans.',
        availableClasses: ['mage', 'paladin', 'ranger', 'warrior', 'priest', 'assassin', 'pirate'],
      },
      {
        slug: 'sun-elf',
        name: 'Sun Elf',
        faction: 'sacred-order',
        image: '/Icons/Races/sun-elf.webp',
        banner: '/Icons/Races/banner-sun-elf.webp',
        tagline: 'One with Nature',
        description: 'From the very beginning, the Sun Elves have shared a deep bond with Nature. Proud, ambitious, and fearsome, they command both forests and battlefields. From a young age, they train in a wide array of elegant weapons, honing skills that blend precision, stealth, and deadly grace.',
        history: 'The first Elves were once Infernal Demons, led by Lady Elyssandra in a bold rebellion against the Demon King. Ambushed and condemned to death, they struck a pact with the Moon Goddess Elvin and the Sun God Thallan, embracing the Gods of Order and transforming into the elegant and powerful Sun Elves. After a daring escape and bloody battle, they seized the Infernal Demons\' latest flotilla and sailed to Irongarth, founding their kingdom in the richest forests and building their radiant capital, Astra Lumina. But peace was fleeting. When Humans set foot on Irongarth and sought the Sun Elves\' forests for themselves, a long war erupted, ending only with the fall of the Great Human Empire. Facing the rising threat of the Domination, the Sun Elves joined the Sacred Order, standing alongside the other races to defend their homeland and stop the advance of Chaos.',
        availableClasses: ['paladin', 'druid', 'ranger', 'warrior', 'priest', 'assassin', 'mystic'],
      },
      {
        slug: 'dwarf',
        name: 'Dwarf',
        faction: 'sacred-order',
        image: '/Icons/Races/dwarf.webp',
        banner: '/Icons/Races/banner-dwarf.webp',
        tagline: 'Light in the Depths',
        description: 'Strong, stout, and hardworking, the Dwarves love to fight, but also value life, as well as well-crafted tools, weapons, and armor. Devout in their faith, they carry the light of the Gods of Order deep into every mountain they dig through.',
        history: 'For centuries, the Dwarves ruled the depths of the largest mountain range on Mynorath, while exploring the lands above and building a kingdom unmatched in science and craftsmanship, surpassing both the brutal Orcs and daring Humans. Yet the Orcs, born for war, attacked mercilessly, and the Great Empire scouts raided the northern strongholds. The Depth Clans fell into disunity, and defeat followed. King Goldbeard led his followers to the Humans, seeking to preserve the Dwarven race, while some Depth Elders embraced the Gods of Chaos and joined the Orcish Chieftainate - a plan whose failure claimed countless lives. The Goldbeard Clan spent hundreds of years in servitude. Even after joining the Sacred Order, many Dwarves continued to live and work alongside Humans, their wealth and fate forever intertwined. After the fall of the Great Empire, some refugees returned to Mynorath, but most followed the Humans to Irongarth, where they joined the Clans, mining the continent\'s highest and richest mountains. For a Dwarf, a connection to the Depths can never be broken.',
        availableClasses: ['paladin', 'ranger', 'warrior', 'priest', 'assassin', 'necromancer', 'pirate'],
      },
      {
        slug: 'bearan',
        name: 'Bearan',
        faction: 'sacred-order',
        image: '/Icons/Races/bearan.webp',
        banner: '/Icons/Races/banner-bearan.webp',
        tagline: 'Unstoppable Force of Nature',
        description: 'Powerful and proud, the Bearans are fierce predators known for their explosive temperaments and superior hunting and fighting skills. Dominant and wild forest spirits, they also value loyalty and a good sense of humor.',
        history: 'On an island far to the north, where the snow and ice never fully melt, a mystical Bear gathered the Bearans around a great lake to sing the songs of Wisdom and grant the primal predators the gift of sentience. She also gave them a set of remembering stones to help guide them on the path of Nature. The stones were inlaid in an armor set, and whoever was chosen to wear it became an Ursan of the Bearans, leaving behind their name and clan to serve the greatness of the whole race. The simple life of the Bearan clans ended when Humans set foot on their land. After a long and bloody war, many were taken into servitude, while the lucky few hid deep in the ice of the North to follow the Old Ways. Hundreds of years passed before the Bearans became respected allies of the Humans. Yet when disaster struck and the Great Empire fell, the refugees traveled to Irongarth, never giving up on being proud members of the Sacred Order.',
        availableClasses: ['paladin', 'druid', 'ranger', 'warrior', 'priest', 'mystic', 'pirate'],
      },
    ],
  },
  domination: {
    name: 'The Domination',
    icon: '/Icons/Factions/domination.webp',
    summary: 'No one dares defy this blood-bound pact. From chaos, the Domination rose - a force of freedom, iron will, and relentless triumph.',
    lore: [
      'Long before the fall of the Great Human Empire, the Undead had already claimed parts of Irongarth, their decadent cities pulsing with ancient power and echoes of memory. As the refugees arrived, old resentments flared and restless feuds awakened. To challenge the Sacred Order, they sought allies in unexpected places: the Orcs - hardened survivors of endless wars who saw the Order as tyranny; the Gronthar - brutish, cunning, and anarchic by nature; and the Infernal Demons, pledging their flames to the cause of Chaos.',
      'Despite their differences, these four forces forged a powerful alliance: the Domination. A banner of rebellion, freedom, and conquest, they fight to unmake the Order, shatter its laws, and reshape the world under their own vision.',
      'But beyond their bloody banner, another force stirs - a being embodying everything they despise: ancient hierarchy, cold dominion, and the arrogance of singular rule. Even in the face of the Ice Dragon, they will not bow. The drums of war thunder across Aragon - and the wind now carries frost.',
    ],
    races: [
      {
        slug: 'orc',
        name: 'Orc',
        faction: 'domination',
        image: '/Icons/Races/orc.webp',
        banner: '/Icons/Races/banner-orc.webp',
        tagline: 'Pride and Might',
        description: 'Brutal and savage, the Orcs are born to be ultimate war machines, living at the heart of battle from cradle to grave. Children of Chaos, they possess immense strength and endurance, disciplined yet ambitious, violent, and fearsome beyond all other races.',
        history: 'For hundreds of years, the Orcs lived under harsh conditions, facing fierce competition from other proto-races and monsters. Only the toughest and most intelligent survived, becoming the warriors and hunters we know today - the ultimate predators of Aragon. When the Orcen ships appeared on the horizon of Mynorath, the Dwarves were doomed, as Death had come to conquer their homeland. The Orcs built their capital there and expanded further, encountering new worthy foes: the Humans. After the fall of the Great Empire and the deadly spell of the Demon King, many Orcs traveled to Irongarth to stand alongside the Undead and other races of the Domination, waging a bloody war against the Sacred Order.',
        availableClasses: ['mage', 'paladin', 'druid', 'warrior', 'priest', 'mystic', 'pirate'],
      },
      {
        slug: 'infernal-demon',
        name: 'Infernal Demon',
        faction: 'domination',
        image: '/Icons/Races/infernal-demon.webp',
        banner: '/Icons/Races/banner-infernal-demon.webp',
        tagline: 'The Neverending Hunger',
        description: 'Griefthor, the Doom Father, taught the Infernal Demons the forbidden arts of Dark Magic. Wielders of the Infernal Flames and Masters of the Soul Leech, they became unmatched in the arts of war and hunt, yet developed a hunger for power that never lets them rest until all the lands of Aragon are under their heel. While cunning and sly, they always hold true to their words and oaths, proud to fight alongside the Domination in every battle.',
        history: 'From the Gods of Chaos, the Infernal Demons received a gift and a curse worthy of true demonic beings: they are immortal and command the Infernal Flame as long as there are Human souls to feed upon - a hunger that never ends. For thousands of years, they hunted Humans one soul at a time, until the Demon King and Queen combined their unmatched powers to create the Soul Ring. The King unleashed a deadly spell to fill this infernal artifact with millions of souls from all races. Enraged and grieving, the Sun God Thallan, in the avatar of the Fire Dragon, attacked the Demon King and seized the Soul Ring. Yet the power of the artifact was so great that the Demon, the Dragon, and the God\'s magic collided in a cataclysm, rendering the continent nearly uninhabitable. The surviving Infernal Demons fled to Irongarth, joining forces with the Undead under the banner of the Domination, still driven by a single dream and purpose: to destroy the zealous Humans.',
        availableClasses: ['mage', 'paladin', 'ranger', 'assassin', 'necromancer', 'mystic', 'pirate'],
      },
      {
        slug: 'undead',
        name: 'Undead',
        faction: 'domination',
        image: '/Icons/Races/undead.webp',
        banner: '/Icons/Races/banner-undead.webp',
        tagline: 'Different State of Being',
        description: 'How heavy is the burden of knowing you are but a vessel for an immortal soul, reborn only to serve the Gods of Order again and again? The Undead find this unbearable and choose to forsake Life while keeping their Souls, freeing themselves from the Gods\' curse - a sin in the eyes of the living, who despise their immortality and rotting flesh, seeing them as abominations. For the Undead, the loss of family and former friends is tragic, but above all, they demand respect for who they are - a different state of being.',
        history: 'Thousands of years of war left the Humans disheartened and dreaming of immortality. Princess Nepherimas, heir to the throne, made a pact with the God of Fecundity, Tulcior, who opened the gates of Afterdeath to all, allowing souls to live on in rotting bodies. A civil war over the rights of the Undead erupted, and despite Queen Nepherimas\' cunning and political machinations, she and her followers were eventually forced to sail to Irongarth, establishing their kingdom in the extravagant city of Veltharas. There, the Undead purged the surrounding Human settlements and forged new alliances within the Domination, joining the Infernal Demons, Orcs, and Gronthar to stand united against the Sacred Order.',
        availableClasses: ['mage', 'ranger', 'warrior', 'assassin', 'necromancer', 'mystic', 'pirate'],
      },
      {
        slug: 'gronthar',
        name: 'Gronthar',
        faction: 'domination',
        image: '/Icons/Races/gronthar.webp',
        banner: '/Icons/Races/banner-gronthar.webp',
        tagline: 'Taking Life by the Tusks',
        description: 'The Gronthar are smelly, noisy, and ferocious, taking life by the tusks in any way they please. Inventively disciplined and audacious, they thrive on a fast-paced lifestyle where slaughtering enemies, guzzling, and lushing reign supreme.',
        history: 'Not long ago, the wild Gronthars awoke to find they possessed wits, wisdom, and memory. On the night of their birth, a true Goddess stomped across the lands, plucking stars from the clouds, her voice rumbling like thunder. \'Cower before Gronthah, children of Machialfi!\' she declared. \'For I am your Mother.\' She then drew a lightning dagger and split the sky, merging sea, river, and land in a storm of muddy downpour. This is how the Gronthars came to be - at least, according to the legend all newborn Gronthars first hear. They also learn that Grontah is a harsh mistress; mercy should never be expected from the hands of the Chaos Gods, especially from the Quake Mother. Taken from the Machialfi Jungles straight into the Great Human Empire, the Gronthar clans were forced into servitude, absorbing fragments of human culture along the way. They fought for their masters until the Night of the Crimson Leaves, when Chief Violence led them to freedom. Finding new mentors in the fierce Orcs, they became mercenaries for the Domination and later joined the Pact. After the deadly spell of the Demon King, the Gronthars traveled to Irongarth to continue the war against the Sacred Order.',
        availableClasses: ['druid', 'ranger', 'warrior', 'assassin', 'necromancer', 'mystic', 'pirate'],
      },
    ],
  },
};

export const allRaces: Race[] = [
  ...factions.sacredOrder.races,
  ...factions.domination.races,
];
