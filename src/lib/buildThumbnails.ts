import type { RealTalentNode } from './talentData';

/**
 * Return the start nodes (max 2) the build picked. SoH builds are defined
 * by their two starting talents; we surface those as the build's identity.
 */
export function getStartNodes(
  allocation: string,
  nodes: RealTalentNode[],
): RealTalentNode[] {
  if (!allocation || !nodes.length) return [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const allocatedIds = allocation
    .split(',')
    .map((pair) => parseInt(pair.split(':')[0], 10))
    .filter((id) => nodeMap.has(id));
  return allocatedIds
    .map((id) => nodeMap.get(id)!)
    .filter((n) => n.nodeType === 'start')
    .slice(0, 2);
}
