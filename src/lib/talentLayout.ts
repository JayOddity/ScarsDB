// Generates a web-like talent tree layout similar to Path of Exile / Scars of Honor
// 6 start nodes in a hex ring, branches radiating outward with cross-connections

export interface LayoutNode {
  id: number;
  dx: number;
  dy: number;
  nodeType: 'start' | 'minor' | 'major' | 'keystone' | 'active';
  branch: number; // which start node this belongs to (0-5)
  depth: number;  // distance from start
}

export interface LayoutEdge {
  from: number;
  to: number;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  center: { x: number; y: number };
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 48271 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateTreeLayout(classSeed: number): TreeLayout {
  const rand = seededRng(classSeed);
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  let nextId = 1;

  // 6 start nodes in a hexagonal ring, radius ~380
  const startRadius = 380;
  const startNodes: LayoutNode[] = [];
  for (let i = 0; i < 6; i++) {
    // Hex angles: -90, -30, 30, 90, 150, 210 degrees (top first, clockwise)
    const angle = ((i * 60) - 90) * (Math.PI / 180);
    const dx = Math.round(Math.cos(angle) * startRadius + (rand() - 0.5) * 30);
    const dy = Math.round(Math.sin(angle) * startRadius + (rand() - 0.5) * 30);
    const node: LayoutNode = {
      id: nextId++,
      dx, dy,
      nodeType: 'start',
      branch: i,
      depth: 0,
    };
    nodes.push(node);
    startNodes.push(node);
  }

  // For each start node, grow 2-3 main branches outward
  const branchNodes: Map<number, LayoutNode[]> = new Map();

  for (let si = 0; si < 6; si++) {
    const start = startNodes[si];
    const outAngle = Math.atan2(start.dy, start.dx); // angle from center
    const numBranches = 2 + (rand() > 0.5 ? 1 : 0);
    const branchGroup: LayoutNode[] = [start];

    for (let b = 0; b < numBranches; b++) {
      // Each branch spreads at a slightly different angle
      const spread = 0.7;
      const bAngle = outAngle + (b - (numBranches - 1) / 2) * spread + (rand() - 0.5) * 0.2;

      let parentNode = start;
      let px = start.dx;
      let py = start.dy;
      const branchLen = 6 + Math.floor(rand() * 4); // 6-9 nodes per branch

      for (let n = 0; n < branchLen; n++) {
        const stepDist = 90 + rand() * 50;
        const drift = (rand() - 0.5) * 0.5;
        const angle = bAngle + drift;

        const nx = Math.round(px + Math.cos(angle) * stepDist);
        const ny = Math.round(py + Math.sin(angle) * stepDist);

        // Determine type
        let nodeType: LayoutNode['nodeType'] = 'minor';
        if (n === branchLen - 1) {
          nodeType = 'keystone';
        } else if (n > 0 && (n % 3 === 0 || (n === branchLen - 2 && rand() > 0.5))) {
          nodeType = 'major';
        } else if (n > 3 && rand() > 0.85) {
          nodeType = 'active';
        }

        const node: LayoutNode = {
          id: nextId++,
          dx: nx, dy: ny,
          nodeType,
          branch: si,
          depth: n + 1,
        };
        nodes.push(node);
        branchGroup.push(node);
        edges.push({ from: parentNode.id, to: node.id });

        // Occasionally fork a short side-branch
        if (n > 1 && n < branchLen - 2 && rand() > 0.6) {
          const sideAngle = angle + (rand() > 0.5 ? 1 : -1) * (0.6 + rand() * 0.5);
          const sideDist = 80 + rand() * 40;
          const sx = Math.round(nx + Math.cos(sideAngle) * sideDist);
          const sy = Math.round(ny + Math.sin(sideAngle) * sideDist);
          const sideNode: LayoutNode = {
            id: nextId++,
            dx: sx, dy: sy,
            nodeType: rand() > 0.7 ? 'major' : 'minor',
            branch: si,
            depth: n + 1,
          };
          nodes.push(sideNode);
          branchGroup.push(sideNode);
          edges.push({ from: node.id, to: sideNode.id });

          // Maybe extend side branch one more
          if (rand() > 0.5) {
            const sx2 = Math.round(sx + Math.cos(sideAngle) * (70 + rand() * 40));
            const sy2 = Math.round(sy + Math.sin(sideAngle) * (70 + rand() * 40));
            const sideNode2: LayoutNode = {
              id: nextId++,
              dx: sx2, dy: sy2,
              nodeType: 'minor',
              branch: si,
              depth: n + 2,
            };
            nodes.push(sideNode2);
            branchGroup.push(sideNode2);
            edges.push({ from: sideNode.id, to: sideNode2.id });
          }
        }

        parentNode = node;
        px = nx;
        py = ny;
      }
    }

    branchNodes.set(si, branchGroup);
  }

  // Cross-connections: connect nearby nodes from adjacent branches
  // This creates the "web" effect
  for (let i = 0; i < 6; i++) {
    const nextBranch = (i + 1) % 6;
    const nodesA = branchNodes.get(i) || [];
    const nodesB = branchNodes.get(nextBranch) || [];

    // Find pairs of nodes from adjacent branches that are close
    for (const a of nodesA) {
      if (a.nodeType === 'start') continue;
      for (const b of nodesB) {
        if (b.nodeType === 'start') continue;
        const dist = Math.hypot(a.dx - b.dx, a.dy - b.dy);
        // Connect if reasonably close but not too close
        if (dist > 80 && dist < 200 && rand() > 0.55) {
          // Check we don't already have this edge
          const exists = edges.some(
            (e) => (e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id)
          );
          if (!exists) {
            edges.push({ from: a.id, to: b.id });
          }
        }
      }
    }
  }

  // Add a few long-range bridge nodes between opposite branches
  for (let i = 0; i < 3; i++) {
    const brA = branchNodes.get(i) || [];
    const brB = branchNodes.get(i + 3) || [];
    const innerA = brA.filter((n) => n.depth > 0 && n.depth < 3);
    const innerB = brB.filter((n) => n.depth > 0 && n.depth < 3);

    if (innerA.length > 0 && innerB.length > 0 && rand() > 0.4) {
      const a = innerA[Math.floor(rand() * innerA.length)];
      const b = innerB[Math.floor(rand() * innerB.length)];
      // Place a bridge node between them
      const mx = Math.round((a.dx + b.dx) / 2 + (rand() - 0.5) * 40);
      const my = Math.round((a.dy + b.dy) / 2 + (rand() - 0.5) * 40);
      const bridge: LayoutNode = {
        id: nextId++,
        dx: mx, dy: my,
        nodeType: 'minor',
        branch: -1,
        depth: 2,
      };
      nodes.push(bridge);
      edges.push({ from: a.id, to: bridge.id });
      edges.push({ from: bridge.id, to: b.id });
    }
  }

  return {
    nodes,
    edges,
    center: { x: 0, y: 0 },
  };
}
