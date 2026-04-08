import type { RealTalentNode } from './talentData';

/**
 * Extract 4 featured talent nodes from a build allocation:
 * - First 2: earliest major/active nodes allocated (closest to center, lowest |dy|)
 * - Last 2: furthest major/active nodes allocated (highest |dy|)
 *
 * Falls back to minor nodes if not enough major/active.
 * Returns up to 4 nodes.
 */
export function getFeaturedNodes(
  allocation: string,
  nodes: RealTalentNode[],
): { early: RealTalentNode[]; late: RealTalentNode[] } {
  if (!allocation || !nodes.length) return { early: [], late: [] };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Parse allocation to get allocated node IDs
  const allocatedIds = allocation
    .split(',')
    .map((pair) => parseInt(pair.split(':')[0], 10))
    .filter((id) => nodeMap.has(id));

  // Get allocated nodes, prefer major/active but fall back to all
  const allocated = allocatedIds
    .map((id) => nodeMap.get(id)!)
    .filter((n) => n.nodeType !== 'start');

  const significant = allocated.filter(
    (n) => n.nodeType === 'major' || n.nodeType === 'active',
  );

  const pool = significant.length >= 4 ? significant : allocated;

  // Sort by distance from center (|dy|)
  const sorted = [...pool].sort(
    (a, b) => Math.abs(a.dy) - Math.abs(b.dy),
  );

  const early = sorted.slice(0, 2);
  const late = sorted.length > 2 ? sorted.slice(-2).reverse() : [];

  return { early, late };
}
