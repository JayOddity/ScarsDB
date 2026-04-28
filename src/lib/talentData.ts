// Talent calculator currently WIP — node data archived, not served.
export const REAL_DATA_CLASSES = [
  'warrior', 'ranger', 'mage', 'paladin', 'assassin',
  'priest', 'druid', 'necromancer', 'pirate', 'mystic',
];

export interface RealTalentNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: 'start' | 'minor' | 'major' | 'keystone' | 'active';
  name: string;
  description: string;
  maxRank: number;
  iconUrl?: string | null;
}

export interface RealTalentEdge {
  from: number;
  to: number;
}

export interface RealTalentData {
  class: string;
  accentColor: string;
  glowColor?: string;
  center: { x: number; y: number };
  nodes: RealTalentNode[];
  connections: RealTalentEdge[];
}

export function hasRealData(classSlug: string): boolean {
  return REAL_DATA_CLASSES.includes(classSlug);
}
