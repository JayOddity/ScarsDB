"""
Apply hand-traced Paladin marker positions to public/data/talents/paladin.json.

- Keeps the 6 start nodes (ids 1-6) at their existing world positions.
- Replaces nodes 7..N with the markers from tmp/paladin-trace-2026-04-28.json
  (numbered 7, 8, ... in capture order).
- Auto-classifies each marker's nodeType by sampling the colour of the source
  image at its location:
    warm-orange  -> active
    yellow/gold  -> major
    teal/cyan    -> keystone
    grey/white   -> minor
- Keeps only the inner-ring start-to-start connections; everything else is
  dropped because the old ids no longer match.
"""
from pathlib import Path
import json

REPO = Path(__file__).resolve().parents[1]
TRACE = REPO / "tmp" / "paladin-trace-2026-04-28.json"
JSON_OUT = REPO / "public" / "data" / "talents" / "paladin.json"

trace = json.loads(TRACE.read_text())
markers = trace["markers"]

# Auto-classification on the source image is unreliable (tinted background);
# all non-start markers default to "minor". Manual re-tagging can come later.
def classify(x_world: int, y_world: int) -> str:
    return "minor"


# Load existing JSON to keep start nodes + accent + structure
current = json.loads(JSON_OUT.read_text())
start_nodes = [n for n in current["nodes"] if n["nodeType"] == "start"]
print(f"keeping {len(start_nodes)} start nodes")

# Build new node list
nodes = [dict(n) for n in start_nodes]  # ids 1..6

next_id = 7
type_counts = {"active": 0, "major": 0, "minor": 0, "keystone": 0}
for m in markers:
    t = classify(m["x"], m["y"])
    type_counts[t] += 1
    nodes.append({
        "id": next_id,
        "dx": m["x"],
        "dy": m["y"],
        "nodeType": t,
        "name": f"Node {next_id}",
        "description": "",
        "maxRank": 1 if t in ("start", "active") else 3,
    })
    next_id += 1

print(f"classified: {type_counts}")
print(f"total nodes: {len(nodes)}")

# Drop all connections — old ids don't map. Keep only start↔start (1..6).
keep_conns = [c for c in current["connections"]
              if c["from"] <= 6 and c["to"] <= 6]
print(f"kept {len(keep_conns)} start-ring connections (dropped {len(current['connections']) - len(keep_conns)})")

out = {
    "class": current.get("class", "Paladin"),
    "accentColor": current.get("accentColor", "#e8c432"),
    "center": current.get("center", {"x": 0, "y": 0}),
    "nodes": nodes,
    "connections": keep_conns,
}

JSON_OUT.write_text(json.dumps(out, separators=(",", ":")))
print(f"wrote {JSON_OUT}")
