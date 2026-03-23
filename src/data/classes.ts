export interface Subclass {
  name: string;
  roles: string[];
  damageTypes: string[];
  description: string;
}

export interface GameClass {
  slug: string;
  name: string;
  icon: string;
  role: string;
  description: string;
  lore: string;
  strengths: string[];
  weaknesses: string[];
  subclasses: Subclass[];
  tips: string[];
}

export const classes: GameClass[] = [
  {
    slug: 'warrior',
    name: 'Warrior',
    icon: '⚔️',
    role: 'Melee',
    description: 'Masters of martial combat who dominate the battlefield with raw strength and tactical prowess. Warriors excel in close-quarters fights, wielding heavy weapons and wearing the thickest armor.',
    lore: 'Forged in the fires of countless battles across Aragon, Warriors are the backbone of any fighting force. They draw their power not from magic or divine blessing, but from sheer determination and years of grueling training.',
    strengths: ['High survivability and armor', 'Excellent crowd control', 'Strong in both solo and group content', 'Versatile tank or DPS roles'],
    weaknesses: ['Vulnerable to kiting', 'Resource-heavy abilities', 'Limited ranged options', 'Slower mobility than light classes'],
    subclasses: [
      { name: 'Pathfinder', roles: ['DPS'], damageTypes: ['Physical'], description: 'A mobile melee fighter who strikes fast and exploits enemy weaknesses with precision attacks.' },
      { name: 'Vanguard', roles: ['Tank'], damageTypes: ['Physical'], description: 'An unyielding shield wall who absorbs punishment and protects allies with defensive mastery.' },
      { name: 'Berserker', roles: ['DPS'], damageTypes: ['Physical'], description: 'A furious combatant who sacrifices defense for overwhelming offensive power and berserking rage.' },
    ],
    tips: [
      'Start with Vanguard path if you\'re new — it\'s the most forgiving for learning mechanics.',
      'Manage your rage resource carefully; don\'t spam abilities on cooldown.',
      'Pair defensive talents with offensive ones for a balanced hybrid build.',
      'Position yourself between enemies and your healer in group content.',
      'Use crowd control abilities to interrupt dangerous enemy casts.',
      'Experiment with two-handed vs. sword-and-shield to find your preferred style.',
    ],
  },
  {
    slug: 'paladin',
    name: 'Paladin',
    icon: '🛡️',
    role: 'Melee',
    description: 'Holy warriors who combine martial might with divine magic. Paladins can tank, heal, or deal damage, making them one of the most versatile classes in Aragon.',
    lore: 'Paladins are the chosen champions of the Sacred Order, blessed with the power of light. Their oath binds them to protect the innocent and smite the forces of darkness wherever they may lurk.',
    strengths: ['Excellent versatility (tank, heal, DPS)', 'Strong self-sustain', 'Powerful group buffs and auras', 'Effective against undead enemies'],
    weaknesses: ['Jack of all trades, master of none', 'Mana-dependent for healing', 'Slower kill speed than pure DPS', 'Requires commitment to one role in endgame'],
    subclasses: [
      { name: 'Inquisitor', roles: ['DPS'], damageTypes: ['Holy', 'Physical'], description: 'A zealous crusader who channels holy fire to purge enemies with righteous fury.' },
      { name: 'Templar', roles: ['Tank'], damageTypes: ['Holy'], description: 'A divine bulwark who uses holy shields and consecrated ground to protect allies.' },
      { name: 'Crusader', roles: ['Healer', 'Support'], damageTypes: ['Holy'], description: 'A battle-medic who heals allies through combat, channeling holy power with every strike.' },
    ],
    tips: [
      'Auras affect your entire group — choose them based on your party composition.',
      'Inquisitor path excels against undead and demon enemies in PvE.',
      'Templar is the strongest magical damage tank in the game.',
      'Keep your mana reserve above 30% for emergency heals.',
      'Crusader healing scales with your melee damage — stay in the fight.',
      'Swap between auras between pulls to maximize efficiency.',
    ],
  },
  {
    slug: 'mage',
    name: 'Mage',
    icon: '🔮',
    role: 'Ranged',
    description: 'Wielders of arcane power who devastate enemies from afar with elemental spells. Mages command fire, ice, and raw arcane energy to control and destroy.',
    lore: 'The mages of Aragon draw power from the Weave — an invisible tapestry of magical energy that permeates the world. Through years of study in the great academies, they learn to bend reality itself.',
    strengths: ['Highest burst damage potential', 'Strong area-of-effect abilities', 'Excellent crowd control (freezes, slows)', 'Powerful in PvP and PvE'],
    weaknesses: ['Very fragile (low armor/HP)', 'Mana management is critical', 'Vulnerable when caught in melee', 'Long cast times on powerful spells'],
    subclasses: [
      { name: 'Battlemage', roles: ['DPS'], damageTypes: ['Fire', 'Arcane'], description: 'A close-range caster who enhances weapons with magic and fights on the frontline.' },
      { name: 'Runeweaver', roles: ['DPS', 'Support'], damageTypes: ['Arcane', 'Ice'], description: 'A tactical mage who places runic traps and barriers to control the battlefield.' },
      { name: 'Wizard', roles: ['DPS'], damageTypes: ['Fire', 'Ice', 'Arcane'], description: 'A pure spellcaster who channels devastating elemental destruction from maximum range.' },
    ],
    tips: [
      'Wizard is the simplest path to learn — focus on positioning and cast timing.',
      'Battlemage is surprisingly tanky for a mage — consider it for solo play.',
      'Always have an escape ability talented — Blink or Ice Block can save your life.',
      'Manage your mana with lower-cost filler spells between big casts.',
      'Runeweaver excels in PvP by controlling chokepoints.',
      'Elemental resistances matter — swap damage types based on enemy weaknesses.',
    ],
  },
  {
    slug: 'priest',
    name: 'Priest',
    icon: '✨',
    role: 'Ranged',
    description: 'Divine spellcasters who serve as the primary healers of Aragon. Priests channel holy or shadow magic to mend allies or smite foes.',
    lore: 'Priests commune with the divine forces of Aragon, acting as conduits between mortals and the celestial powers. Some embrace the light, while others delve into forbidden shadow arts.',
    strengths: ['Best pure healing in the game', 'Strong group utility and buffs', 'Shadow spec offers competitive DPS', 'Essential for endgame group content'],
    weaknesses: ['Fragile in solo combat', 'Shadow and Holy are completely different playstyles', 'High priority target in PvP', 'Limited mobility'],
    subclasses: [
      { name: 'Cleric', roles: ['Healer'], damageTypes: ['Holy'], description: 'A devoted healer who excels at keeping groups alive through sustained, powerful healing.' },
      { name: 'Worshipper', roles: ['DPS'], damageTypes: ['Shadow'], description: 'A shadow priest who deals damage over time and drains enemy life force.' },
      { name: 'Exorcist', roles: ['DPS', 'Healer'], damageTypes: ['Holy', 'Shadow'], description: 'A hybrid caster who balances light and dark to both heal and harm simultaneously.' },
    ],
    tips: [
      'Cleric is the most sought-after healer spec for dungeons and raids.',
      'Worshipper has excellent solo leveling speed due to self-sustain.',
      'Exorcist is complex but rewarding — practice your rotation on dummies.',
      'Keep shield abilities on cooldown for proactive damage prevention.',
      'In PvP, positioning is everything — stay behind your frontline.',
      'Mana management is crucial; learn when to use efficient vs. powerful heals.',
    ],
  },
  {
    slug: 'ranger',
    name: 'Ranger',
    icon: '🏹',
    role: 'Ranged',
    description: 'Expert marksmen and wilderness survivalists who strike from afar. Rangers combine ranged weapon mastery with nature-based traps and companion creatures.',
    lore: 'Rangers are the wardens of Aragon\'s vast wilderness. They patrol the borders between civilization and the untamed wilds, their keen eyes and steady hands protecting the unwary from threats unseen.',
    strengths: ['Excellent sustained ranged DPS', 'Strong kiting ability', 'Versatile trap mechanics', 'Good in both PvE and PvP'],
    weaknesses: ['Weaker in melee range', 'Pet management adds complexity', 'Trap setup requires planning', 'Less burst than mages'],
    subclasses: [
      { name: 'Sharpshooter', roles: ['DPS'], damageTypes: ['Physical'], description: 'A precision archer who maximizes ranged damage with powerful aimed shots and critical strikes.' },
      { name: 'Trapper', roles: ['DPS', 'Support'], damageTypes: ['Physical', 'Nature'], description: 'A tactical fighter who controls zones with traps, snares, and area denial abilities.' },
      { name: 'Artificer', roles: ['DPS'], damageTypes: ['Physical', 'Fire'], description: 'A gadget-wielding engineer who uses mechanical devices and explosives alongside ranged attacks.' },
    ],
    tips: [
      'Sharpshooter rewards perfect positioning — stay at maximum range always.',
      'Trapper is excellent for solo content and PvP with zone control.',
      'Artificer has the highest AoE damage among Ranger specs.',
      'Learn to kite — move between shots to maintain distance from melee.',
      'Pre-place traps before pulls in dungeons for massive opening damage.',
      'Your mobility is your defense — never stand still if you can help it.',
    ],
  },
  {
    slug: 'druid',
    name: 'Druid',
    icon: '🌿',
    role: 'Melee / Ranged',
    description: 'Shape-shifting nature casters who adapt to any role. Druids can transform into powerful beasts, heal with nature magic, or command the forces of the wild.',
    lore: 'Druids are the voice of nature in Aragon. They form an ancient pact with the land itself, drawing power from the forests, rivers, and beasts. Their shape-shifting abilities make them unpredictable.',
    strengths: ['Most versatile class — can fill any role', 'Shape-shifting provides unique mechanics', 'Strong healing over time', 'Excellent solo survivability'],
    weaknesses: ['Forms lock you out of certain abilities', 'Complex to master all forms', 'Less specialized than dedicated classes', 'Gear requirements span multiple stats'],
    subclasses: [
      { name: 'Oracle', roles: ['Healer'], damageTypes: ['Nature'], description: 'A nature healer who uses powerful heal-over-time effects and rejuvenation magic.' },
      { name: 'Beastmaster', roles: ['DPS', 'Summoner'], damageTypes: ['Nature', 'Physical'], description: 'A wild caller who summons and commands beasts while fighting alongside them.' },
      { name: 'Shapeshifter', roles: ['DPS', 'Tank'], damageTypes: ['Physical', 'Nature'], description: 'A form-shifting warrior who transforms into powerful beasts for melee combat.' },
    ],
    tips: [
      'Shapeshifter bear form is a viable tank — don\'t overlook it.',
      'Oracle healing-over-time stacks are your bread and butter — keep them rolling.',
      'Beastmaster pets need to be managed; position them to avoid cleave damage.',
      'Learn to shift forms mid-combat for maximum flexibility.',
      'Nature damage ignores some armor — use it against heavily armored foes.',
      'Druid is the best class for world exploration thanks to travel forms.',
    ],
  },
  {
    slug: 'assassin',
    name: 'Assassin',
    icon: '🗡️',
    role: 'Melee',
    description: 'Shadow-wielding melee fighters who strike from stealth with lethal precision. Assassins excel at eliminating single targets with devastating burst combos.',
    lore: 'Operating from the shadows of Aragon\'s great cities, Assassins are the unseen hand that shapes the fate of nations. Their guilds are whispered of in fear, their blades finding even the most protected targets.',
    strengths: ['Highest single-target burst damage', 'Stealth and gap-closing abilities', 'Excellent in PvP', 'Strong evasion and dodge mechanics'],
    weaknesses: ['Very fragile when caught', 'Stealth-dependent openers', 'Weaker sustained AoE damage', 'High skill ceiling'],
    subclasses: [
      { name: 'Bladedancer', roles: ['DPS'], damageTypes: ['Physical'], description: 'A swift dual-wielder who chains attacks in fluid combos for sustained melee damage.' },
      { name: 'Spellbane', roles: ['DPS'], damageTypes: ['Physical', 'Shadow'], description: 'An anti-mage specialist who disrupts casters and steals magical energy.' },
      { name: 'Bounty Hunter', roles: ['DPS'], damageTypes: ['Physical', 'Poison'], description: 'A ruthless tracker who uses poisons, traps, and dirty tactics to eliminate targets.' },
    ],
    tips: [
      'Always open from stealth — your opener abilities deal 2-3x normal damage.',
      'Bladedancer has the smoothest rotation for beginners.',
      'Spellbane is the ultimate PvP anti-caster — prioritize silence talents.',
      'Bounty Hunter poisons stack — apply them before your burst window.',
      'Save your vanish for emergencies, not just re-openers.',
      'Learn enemy cast bars — interrupting key abilities is more valuable than raw DPS.',
    ],
  },
  {
    slug: 'necromancer',
    name: 'Necromancer',
    icon: '💀',
    role: 'Melee / Ranged',
    description: 'Dark spellcasters who command the forces of death. Necromancers raise undead minions, drain life force, and wield blood magic to devastate their enemies.',
    lore: 'Necromancers walk the thin line between life and death. Once shunned by all of Aragon\'s societies, their mastery over death has become a necessary weapon against the growing darkness that threatens the world.',
    strengths: ['Strong pet/minion army', 'Excellent self-healing through life drain', 'Unique blood magic mechanics', 'Good sustained damage'],
    weaknesses: ['Minions can be AoE\'d down', 'Blood magic costs HP to cast', 'Socially stigmatized (lore-wise)', 'Complex resource management'],
    subclasses: [
      { name: 'Voidlord', roles: ['Summoner', 'DPS'], damageTypes: ['Shadow', 'Void'], description: 'A master summoner who raises powerful undead armies to overwhelm enemies.' },
      { name: 'Lich', roles: ['DPS'], damageTypes: ['Shadow', 'Ice'], description: 'A pure death caster who channels devastating necrotic and frost spells.' },
      { name: 'Bloodmage', roles: ['DPS', 'Healer'], damageTypes: ['Shadow', 'Physical'], description: 'A blood magic practitioner who sacrifices HP for power and heals allies through damage.' },
    ],
    tips: [
      'Voidlord is the strongest solo class — your army tanks for you.',
      'Lich has incredible AoE burst with corpse explosion combos.',
      'Bloodmage is a unique healer that heals by dealing damage — stay aggressive.',
      'Manage your blood/health resource carefully — don\'t overcast and kill yourself.',
      'Position minions to body-block for you in PvP.',
      'Corpse abilities are powerful — fight near fallen enemies for bonus resources.',
    ],
  },
  {
    slug: 'pirate',
    name: 'Pirate',
    icon: '☠️',
    role: 'Melee / Ranged',
    description: 'Swashbuckling rogues who combine swordplay with gunpowder and supernatural curses. Pirates fight dirty and use every trick at their disposal.',
    lore: 'The Pirates of Aragon sail cursed seas and plunder forgotten ruins. Whether wielding cutlass, pistol, or dark voodoo, they live by one rule: take what you can, give nothing back.',
    strengths: ['Unique hybrid melee/ranged combat', 'Fun and flashy playstyle', 'Strong mobility with grapple and dash', 'Curse debuffs weaken enemies'],
    weaknesses: ['Split scaling between melee and ranged', 'Curse management adds complexity', 'Less raw armor than warriors', 'Gunpowder abilities have ammo/cooldowns'],
    subclasses: [
      { name: 'Swashbuckler', roles: ['DPS'], damageTypes: ['Physical'], description: 'A flashy duelist who combines sword mastery with acrobatic combat moves.' },
      { name: 'Cursed', roles: ['DPS', 'Support'], damageTypes: ['Shadow', 'Physical'], description: 'A voodoo practitioner who hexes enemies with powerful curses and debuffs.' },
      { name: 'Buccaneer', roles: ['DPS', 'Tank'], damageTypes: ['Physical', 'Fire'], description: 'A tough brawler who uses pistols, bombs, and brute force to dominate fights.' },
    ],
    tips: [
      'Swashbuckler combo points build fast — don\'t sit on them, spend them.',
      'Cursed debuffs stack and amplify your party\'s damage — great group utility.',
      'Buccaneer\'s pistol shots can be weaved between melee attacks.',
      'Grapple hook is both an engage and escape — use it wisely.',
      'Bomb abilities have friendly fire in PvP — aim carefully.',
      'Pirate is the most fun class in the game — enjoy the ride.',
    ],
  },
  {
    slug: 'mystic',
    name: 'Mystic',
    icon: '🌙',
    role: 'Ranged',
    description: 'Enigmatic spellcasters who channel cosmic and plague-based magic. Mystics wield celestial power, disease, and ancient forbidden knowledge.',
    lore: 'Mystics peer beyond the veil of reality, communing with cosmic forces that most mortals cannot comprehend. Their power comes from the stars, from plague, and from ancient rites lost to time.',
    strengths: ['Unique damage types (celestial, plague)', 'Strong damage-over-time abilities', 'Good healing through Plague Doctor', 'Enemies struggle with resistance'],
    weaknesses: ['Damage ramps up slowly', 'Squishier than priests', 'Niche playstyle not for everyone', 'DoT-heavy builds weak in burst PvP'],
    subclasses: [
      { name: 'Celestial', roles: ['DPS'], damageTypes: ['Arcane', 'Holy'], description: 'A star-wielder who calls down cosmic energy and celestial fire on enemies.' },
      { name: 'Plague Doctor', roles: ['Healer', 'DPS'], damageTypes: ['Nature', 'Poison'], description: 'A physician who uses plague and antidotes to harm enemies and heal allies simultaneously.' },
      { name: 'Acolyte', roles: ['DPS', 'Support'], damageTypes: ['Shadow', 'Arcane'], description: 'A forbidden knowledge seeker who debuffs enemies and empowers allies with dark rituals.' },
    ],
    tips: [
      'Celestial is a strong ranged DPS alternative to Mage with different damage types.',
      'Plague Doctor is a unique healer — your DoTs on enemies generate healing for allies.',
      'Acolyte buffs are some of the strongest in the game — raids want one.',
      'Your damage takes time to ramp — front-load DoTs before burst windows.',
      'Celestial abilities look incredible — enjoy the star-fall animations.',
      'Mystic pairs well with Necromancer in group content for shadow synergies.',
    ],
  },
];

export const factions = {
  sacredOrder: {
    name: 'The Sacred Order',
    description: 'United by faith and honor, The Sacred Order stands as the last bastion of light in Aragon.',
    races: [
      { name: 'Human', icon: '👤', description: 'Adaptable and ambitious, humans form the backbone of The Sacred Order.' },
      { name: 'Sun Elf', icon: '🧝', description: 'Ancient and wise, Sun Elves wield the magic of light and starfire.' },
      { name: 'Dwarf', icon: '⛏️', description: 'Stout and unyielding, Dwarves are master craftsmen and fierce warriors.' },
      { name: 'Bearan', icon: '🐻', description: 'Noble bear-folk who honor the old ways of nature and strength.' },
    ],
  },
  domination: {
    name: 'The Domination',
    description: 'Bound by power and conquest, The Domination seeks to reshape Aragon under its iron will.',
    races: [
      { name: 'Infernal Demon', icon: '😈', description: 'Flame-born warriors who channel hellfire and dark pacts.' },
      { name: 'Undead', icon: '🧟', description: 'Risen from death, the Undead serve with unwavering loyalty to The Domination.' },
      { name: 'Orc', icon: '👹', description: 'Savage and proud, Orcs are born warriors who live for the thrill of battle.' },
      { name: 'Gronthar', icon: '🦎', description: 'Reptilian warriors with ancient blood, tough scales, and primal cunning.' },
    ],
  },
};
