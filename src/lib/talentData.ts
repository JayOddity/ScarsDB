// Classes whose talent JSON is the real datamined tree (vs. synthetic placeholder).
// The other 6 classes have empty/stub talent trees in the playtest client itself,
// so we leave their slots blocked until the devs ship them.
export const REAL_DATA_CLASSES = [
  'ranger', 'paladin', 'druid', 'mage',
];

export function isClassImplemented(classSlug: string): boolean {
  return REAL_DATA_CLASSES.includes(classSlug);
}

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
