import worldData from './map-pois/world.json';
import worldExtrasData from './map-pois/world-extras.json';
import worldQuestGiversData from './map-pois/world-quest-givers.json';
// Chests removed from atlas (real loot chest positions are server-side, manual
// placements were misleading). Re-import worldChestsManualData if reinstating.
// import worldChestsManualData from './map-pois/world-chests-manual.json';
// Re-enable these alongside the matching toMap() entries below when each zone is polished.
// import ondallsFallData from './map-pois/ondalls-fall.json';
// import mourningPassData from './map-pois/mourning-pass.json';
// import thallansRingData from './map-pois/thallans-ring.json';
// import farabaleData from './map-pois/farabale.json';
// import humanHubData from './map-pois/human-hub.json';
// import maelynsLandingData from './map-pois/maelyns-landing.json';

export interface POI {
  id: string;
  category: string;
  name: string;
  x: number;
  y: number;
  source?: string;
  blurb?: string;
  continent?: string;
  questSlug?: string;
  questTitle?: string;
}

export interface RegionPolygon {
  id: string;        // matches POI.id when the polygon represents a named region
  name: string;
  category: string;  // matches POI.category — controls visibility + style
  points: [number, number][];
}

export interface MapDef {
  id: string;
  label: string;
  image: string;
  width: number;
  height: number;
  pois: POI[];
  polygons: RegionPolygon[];
}

interface ZoneJson {
  _meta: { image: string; imageWidth: number; imageHeight: number };
  pois: POI[];
  polygons?: { id: string; name: string; category?: string; points: number[][] }[];
}

function toMap(id: string, label: string, data: ZoneJson): MapDef {
  return {
    id,
    label,
    image: data._meta.image,
    width: data._meta.imageWidth,
    height: data._meta.imageHeight,
    pois: data.pois as POI[],
    polygons: (data.polygons ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? 'region',
      points: p.points.map(([x, y]) => [x, y] as [number, number]),
    })),
  };
}

// All chest placements removed (decorative-chest filler + the manual loot list)
// since real loot chest positions are server-side and the rest were just clutter.
const CHEST_CATEGORIES = new Set(['rareChest', 'fantasticChest', 'mythicalChest', 'decorativeChest']);
const extrasFiltered = (worldExtrasData.pois as POI[]).filter(
  (p) => !CHEST_CATEGORIES.has(p.category),
);

const worldMerged: ZoneJson = {
  _meta: worldData._meta,
  pois: [
    ...(worldData.pois as POI[]).filter((p) => !CHEST_CATEGORIES.has(p.category)),
    ...extrasFiltered,
    ...(worldQuestGiversData.pois as POI[]),
  ],
  polygons: worldData.polygons,
};

export const MAPS: MapDef[] = [
  toMap('world',           'World — Irongarth',     worldMerged),
  // Disabled until polished — re-enable when each zone is ready.
  // toMap('ondalls-fall',    "Ondall's Fall",         ondallsFallData),
  // toMap('mourning-pass',   'Mourning Pass',         mourningPassData),
  // toMap('thallans-ring',   "Thallan's Ring",        thallansRingData),
  // toMap('farabale',        'Farabale',              farabaleData),
  // toMap('human-hub',       'Human Hub',             humanHubData),
  // toMap('maelyns-landing', "Maelyn's Landing",      maelynsLandingData),
];

export type LayerGroupId =
  | 'locations'
  | 'world'
  | 'playtest'
  | 'mobs'
  | 'npcs'
  | 'gathering'
  | 'stations'
  | 'travel'
  | 'interactives'
  | 'pvp';

export interface LayerGroup {
  id: LayerGroupId;
  title: string;
}

export const LAYER_GROUPS: LayerGroup[] = [
  { id: 'locations',    title: 'Locations' },
  { id: 'world',        title: 'World & Map' },
  { id: 'playtest',     title: 'Playtest Content' },
  { id: 'interactives', title: 'Interactives' },
  { id: 'pvp',          title: 'PvP & Conflict' },
  { id: 'mobs',         title: 'Creatures' },
  { id: 'npcs',         title: 'NPCs' },
  { id: 'gathering',    title: 'Resources' },
  { id: 'stations',     title: 'Crafting Stations' },
  { id: 'travel',       title: 'Travel' },
];

export interface LayerConfig {
  key: string;            // matches POI.category
  label: string;
  color: string;          // marker fill
  group: LayerGroupId;
  defaultOn: boolean;
  glyph?: string;         // optional emoji-like glyph rendered inside the marker
}

// Until the atlas has real data behind every layer, only this whitelist appears
// in the sidebar. Add a key here to expose it (e.g. 'mining' once we have ore
// node positions). Layers not in this list are silently dropped from the UI
// and their POIs never render.
export const VISIBLE_LAYER_KEYS: ReadonlySet<string> = new Set([
  'questGiver',
]);

export const LAYERS: LayerConfig[] = [
  // Locations
  { key: 'capital',         label: 'Capitals',         color: '#c8a84e', group: 'locations', defaultOn: false, glyph: '★' },
  { key: 'city',            label: 'Cities',           color: '#e0c068', group: 'locations', defaultOn: false, glyph: '◆' },
  { key: 'settlement',      label: 'Settlements',      color: '#8a6e2f', group: 'locations', defaultOn: false, glyph: '▲' },
  { key: 'island',          label: 'Islands',          color: '#5a9bc8', group: 'locations', defaultOn: false, glyph: '◉' },

  // World & Map
  { key: 'continentLabel',  label: 'Continent Labels', color: '#a89880', group: 'world',     defaultOn: false },
  { key: 'seaLabel',        label: 'Sea Labels',       color: '#5a9bc8', group: 'world',     defaultOn: false },
  { key: 'regionLabel',     label: 'Region Labels',    color: '#a89880', group: 'world',     defaultOn: false },
  { key: 'region',          label: 'Named Regions',    color: '#9d7a3a', group: 'world',     defaultOn: false, glyph: '⬢' },
  { key: 'subZone',         label: 'Sub Zones',        color: '#bf8a4a', group: 'world',     defaultOn: false, glyph: '◇' },

  // Playtest
  { key: 'playtestZone',    label: 'Playtest Zones',   color: '#34d39e', group: 'playtest',  defaultOn: false, glyph: '◈' },
  { key: 'worldBoss',       label: 'World Bosses',     color: '#c43a3a', group: 'playtest',  defaultOn: false, glyph: '✦' },

  // Creatures (placeholders — populated from playtest data)
  { key: 'boss',            label: 'Bosses',           color: '#e05555', group: 'mobs',      defaultOn: false, glyph: '✦' },
  { key: 'eliteMob',        label: 'Elite Mobs',       color: '#f97316', group: 'mobs',      defaultOn: false, glyph: '✚' },
  { key: 'normalMob',       label: 'Normal Mobs',      color: '#9ca3af', group: 'mobs',      defaultOn: false, glyph: '•' },

  // NPCs (placeholders)
  { key: 'questGiver',      label: 'Quest Givers',     color: '#facc15', group: 'npcs',      defaultOn: false, glyph: '!' },
  { key: 'questObjective',  label: 'Quest Objectives', color: '#fde047', group: 'npcs',      defaultOn: false, glyph: '?' },
  { key: 'vendor',          label: 'Vendors',          color: '#34d399', group: 'npcs',      defaultOn: false, glyph: '$' },
  { key: 'trainer',         label: 'Trainers',         color: '#a855f7', group: 'npcs',      defaultOn: false, glyph: '✿' },
  { key: 'stables',         label: 'Stables',          color: '#d97706', group: 'npcs',      defaultOn: false, glyph: '🐴' },
  { key: 'portal',          label: 'Portals',          color: '#a855f7', group: 'travel',    defaultOn: false, glyph: '◯' },
  { key: 'respawnPoint',    label: 'Respawn Points',   color: '#22d3ee', group: 'travel',    defaultOn: false, glyph: '✛' },
  { key: 'craftingBench',   label: 'Crafting Benches', color: '#f59e0b', group: 'stations',  defaultOn: false, glyph: '⚒' },
  { key: 'cookingStation',  label: 'Cooking Stations', color: '#fb7185', group: 'stations',  defaultOn: false, glyph: '🍳' },
  { key: 'alchemyStation',  label: 'Alchemy Stations', color: '#10b981', group: 'stations',  defaultOn: false, glyph: '⚗' },
  { key: 'stronghold',      label: 'Strongholds',      color: '#dc2626', group: 'world',     defaultOn: false, glyph: '⛫' },

  // Resources (placeholders)
  { key: 'mining',          label: 'Mining',           color: '#a16207', group: 'gathering', defaultOn: false, glyph: '⛏' },
  { key: 'woodcutting',     label: 'Woodcutting',      color: '#92400e', group: 'gathering', defaultOn: false, glyph: '🌲' },
  { key: 'herbalism',       label: 'Herbalism',        color: '#65a30d', group: 'gathering', defaultOn: false, glyph: '✿' },
  { key: 'fishing',         label: 'Fishing',          color: '#0ea5e9', group: 'gathering', defaultOn: false, glyph: '🐟' },

  // Travel
  { key: 'warpPoint',       label: 'Warp Points',      color: '#a855f7', group: 'travel',    defaultOn: false, glyph: '◯' },
  { key: 'shipRoute',       label: 'Ship Routes',      color: '#0ea5e9', group: 'travel',    defaultOn: false, glyph: '⛵' },
  { key: 'spawnPoint',      label: 'Spawn Points',     color: '#60a5fa', group: 'travel',    defaultOn: false, glyph: '◇' },
  { key: 'spawner',         label: 'Spawners',         color: '#fb923c', group: 'mobs',      defaultOn: false, glyph: '·' },

  // Interactives (datamined static placements)
  { key: 'graveyard',          label: 'Graveyards',            color: '#6b7280', group: 'interactives', defaultOn: false, glyph: '✟' },
  { key: 'hauntedTree',        label: 'Haunted Trees',         color: '#7c3aed', group: 'interactives', defaultOn: false, glyph: '✦' },
  { key: 'cookingPot',         label: 'Cooking Pots',          color: '#ea580c', group: 'interactives', defaultOn: false, glyph: '◉' },
  { key: 'camp',               label: 'Camps',                 color: '#84cc16', group: 'interactives', defaultOn: false, glyph: '⛺' },
  { key: 'creaturePlaceholder',label: 'Mob Spawn Markers',     color: '#dc2626', group: 'interactives', defaultOn: false, glyph: '◈' },

  // PvP & Conflict
  { key: 'battlefield',        label: 'Battlefields',          color: '#b91c1c', group: 'pvp',          defaultOn: false, glyph: '⚔' },
  { key: 'fortification',      label: 'Fortifications',        color: '#854d0e', group: 'pvp',          defaultOn: false, glyph: '▓' },
  { key: 'cannon',             label: 'Cannons / Siege',       color: '#92400e', group: 'pvp',          defaultOn: false, glyph: '⊙' },
];

export const LAYER_BY_KEY: Record<string, LayerConfig> = Object.fromEntries(
  LAYERS.map((l) => [l.key, l]),
);

export const DEFAULT_LAYER_STATE: Record<string, boolean> = Object.fromEntries(
  LAYERS.map((l) => [l.key, l.defaultOn]),
);
