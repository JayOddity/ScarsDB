"""
Trace the official Paladin talent tree from the high-res in-game screenshot.

Strategy:
- Each node has a small bright "dot" at its centre. Find local brightness
  maxima inside the play area; that's far more reliable than Hough on the
  faint outer ring frames.
- For edges: run Canny edge detection on a normalised gray, then Hough line
  segments. Snap each detected segment's endpoints to the nearest node and
  keep edges where both endpoints snap to a node within tolerance.
- Classify: 6 closest-to-hub = start; warm-coloured = active; large dot peaks
  = major; rest = minor.
"""

from pathlib import Path
import json
import math
import cv2
import numpy as np
from collections import defaultdict
from skimage.morphology import skeletonize

REPO = Path(__file__).resolve().parents[1]
SRC_IMG = REPO.parent / "Example" / "Talent Trees" / "Paladin bright.png"
OUT_JSON = REPO / "public" / "data" / "talents" / "paladin.json"
DEBUG_DIR = REPO / "tmp" / "paladin-trace"
DEBUG_DIR.mkdir(parents=True, exist_ok=True)

WORLD_SCALE = 1.8  # 1 image px -> N world units; tuned so bbox matches the existing camera fit

img = cv2.imread(str(SRC_IMG), cv2.IMREAD_COLOR)
H, W = img.shape[:2]
print(f"image {W}x{H}")

# ---------- Hub via warm yellow blob in central region ----------
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
warm_mask = cv2.inRange(hsv, (10, 100, 150), (35, 255, 255))
central = np.zeros_like(warm_mask)
central[int(H*0.25):int(H*0.75), int(W*0.25):int(W*0.75)] = 255
warm_mask = cv2.bitwise_and(warm_mask, central)
warm_mask = cv2.morphologyEx(warm_mask, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
contours, _ = cv2.findContours(warm_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key=cv2.contourArea, reverse=True)
M = cv2.moments(contours[0])
cx, cy = int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"])
print(f"hub center: ({cx}, {cy})")

# ---------- Mask of valid play area (no top/bottom UI strips, no hub) ----------
play_mask = np.zeros((H, W), dtype=np.uint8)
play_mask[100:H-80, 40:W-40] = 255
# Cut out hub region
cv2.circle(play_mask, (cx, cy), 90, 0, -1)
# Cut out the bottom-right "Refund Build" / counter UI box
cv2.rectangle(play_mask, (W-260, H-180), (W, H), 0, -1)
# Cut out the bottom-left zoom/UI area
cv2.rectangle(play_mask, (0, H-140), (170, H), 0, -1)

# ---------- Node detection via local maxima of dot brightness ----------
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# Boost contrast
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
gray_eq = clahe.apply(gray)

# Each node has a small bright dot at its centre, ~3-5 px wide. Apply a
# top-hat to isolate small bright blobs, then find local peaks.
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
tophat = cv2.morphologyEx(gray_eq, cv2.MORPH_TOPHAT, kernel)
tophat = cv2.bitwise_and(tophat, tophat, mask=play_mask)

# Threshold to find bright blobs
_, blob_mask = cv2.threshold(tophat, 55, 255, cv2.THRESH_BINARY)
# OPEN with a small circular kernel to break thin edge lines but keep round dots
circle_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
blob_mask = cv2.morphologyEx(blob_mask, cv2.MORPH_OPEN, circle_k)

# Connected components, then keep only ROUND blobs
n_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(blob_mask, connectivity=8)
nodes_px = []
for i in range(1, n_labels):
    area = stats[i, cv2.CC_STAT_AREA]
    w = stats[i, cv2.CC_STAT_WIDTH]
    h = stats[i, cv2.CC_STAT_HEIGHT]
    if area < 6 or area > 250: continue
    if w == 0 or h == 0: continue
    aspect = max(w, h) / min(w, h)
    if aspect > 1.8: continue  # too elongated -> probably an edge fragment
    # extent = area / bounding box area: real round dot ~ 0.6-0.9
    extent = area / (w * h)
    if extent < 0.4: continue  # sparse — likely noise
    x, y = centroids[i]
    r = max(8, int(math.sqrt(area / math.pi) * 2.8))
    nodes_px.append((int(x), int(y), r))
print(f"shape-filtered nodes: {len(nodes_px)}")

# Dedupe — merge anything within 18 px
def dedupe(points, thresh=18):
    kept = []
    for p in sorted(points, key=lambda t: -t[2]):
        merged = False
        for k in kept:
            if math.hypot(p[0] - k[0], p[1] - k[1]) < thresh:
                merged = True
                break
        if not merged:
            kept.append(p)
    return kept

nodes_px = dedupe(nodes_px, thresh=20)
print(f"after dedupe: {len(nodes_px)} nodes")

# ---------- Detect square (active) nodes via warm-colour template ----------
warm_active = cv2.inRange(hsv, (12, 110, 140), (32, 255, 255))
warm_active = cv2.bitwise_and(warm_active, warm_active, mask=play_mask)
warm_active = cv2.morphologyEx(warm_active, cv2.MORPH_CLOSE, np.ones((4, 4), np.uint8))
n2, _, stats2, cents2 = cv2.connectedComponentsWithStats(warm_active, connectivity=8)
active_centers = []
for i in range(1, n2):
    a = stats2[i, cv2.CC_STAT_AREA]
    w_ = stats2[i, cv2.CC_STAT_WIDTH]
    h_ = stats2[i, cv2.CC_STAT_HEIGHT]
    if a < 25 or a > 800: continue
    if w_ == 0 or h_ == 0: continue
    aspect = max(w_, h_) / min(w_, h_)
    if aspect > 1.6: continue
    cx2, cy2 = cents2[i]
    if math.hypot(cx2 - cx, cy2 - cy) < 95: continue
    active_centers.append((int(cx2), int(cy2), max(12, int(math.sqrt(a/math.pi) * 2.0))))
print(f"active candidates: {len(active_centers)}")

active_indices = set()
for ax, ay, ar in active_centers:
    best = -1; best_d = 28
    for k, (nx, ny, _) in enumerate(nodes_px):
        d = math.hypot(nx-ax, ny-ay)
        if d < best_d:
            best_d = d; best = k
    if best >= 0:
        nodes_px[best] = (ax, ay, ar)
        active_indices.add(best)
    else:
        nodes_px.append((ax, ay, ar))
        active_indices.add(len(nodes_px) - 1)
print(f"nodes after active merge: {len(nodes_px)}")

# ---------- Edge detection: skeleton-based connected component analysis ----------
# Build a "tree" mask = bright AND low-saturation pixels (white/gray edges
# and node frames). This filters out the cyan nebula glow which is bright
# but highly saturated.
val_thresh = (hsv[:, :, 2] > 75)
sat_thresh = (hsv[:, :, 1] < 90)  # low saturation = white/gray
tree_mask = (val_thresh & sat_thresh).astype(np.uint8) * 255
tree_mask = cv2.bitwise_and(tree_mask, tree_mask, mask=play_mask)
# Close very small gaps along thin edges
tree_mask = cv2.morphologyEx(tree_mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
cv2.imwrite(str(DEBUG_DIR / "tree_mask.png"), tree_mask)

# Mask out node circles. Use radius ≈ frame outer radius so we cleanly separate
# edges from node frames. Empirically frames are ~22 px outer in this screenshot.
node_disk_mask = np.zeros_like(tree_mask)
for x, y, r in nodes_px:
    cv2.circle(node_disk_mask, (x, y), max(20, r + 2), 255, -1)
edge_only = cv2.bitwise_and(tree_mask, cv2.bitwise_not(node_disk_mask))
# Open to remove tiny noise specks
edge_only = cv2.morphologyEx(edge_only, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))

# Skeletonize for clean topology
skel = skeletonize(edge_only > 0).astype(np.uint8) * 255
# Save for debug
cv2.imwrite(str(DEBUG_DIR / "edge_only.png"), edge_only)
cv2.imwrite(str(DEBUG_DIR / "skeleton.png"), skel)

# Connected components on the skeleton — each component is a chain of edge pixels
n_comp, comp_labels = cv2.connectedComponents(skel)
print(f"skeleton components: {n_comp - 1}")

# Match each skeleton component to the nodes it touches via per-pixel distance
node_arr = np.array([(x, y) for x, y, _ in nodes_px], dtype=np.float32)  # (N, 2)
TOUCH_DIST = 35  # pixels — how close a skeleton pixel must come to a node center to "touch" it

edge_set = set()
multi_touch_count = 0
unmatched_count = 0
for c in range(1, n_comp):
    pixels_y, pixels_x = np.where(comp_labels == c)
    if len(pixels_y) < 4: continue  # noise
    # Sample pixels if there are many
    if len(pixels_y) > 80:
        idx = np.linspace(0, len(pixels_y) - 1, 80).astype(int)
        pixels_x = pixels_x[idx]; pixels_y = pixels_y[idx]
    pix = np.stack([pixels_x, pixels_y], axis=1).astype(np.float32)  # (P, 2)
    # min distance from each node to any pixel in this component
    diffs = node_arr[:, None, :] - pix[None, :, :]  # (N, P, 2)
    dists = np.sqrt((diffs ** 2).sum(axis=2))  # (N, P)
    min_dists = dists.min(axis=1)  # (N,)
    touched = np.where(min_dists < TOUCH_DIST)[0]
    if len(touched) < 2:
        unmatched_count += 1
        continue
    if len(touched) == 2:
        a, b = int(touched[0]), int(touched[1])
        edge_set.add((min(a, b), max(a, b)))
    else:
        # Branching component touches >2 nodes. Reconstruct the actual edges by
        # walking the skeleton: each node's contact point is where the component
        # comes closest to that node. Connect each contact-point pair that are
        # geometrically adjacent along the skeleton.
        contacts = []
        for k in touched:
            best = int(np.argmin(dists[k]))
            contacts.append((int(k), int(pix[best, 0]), int(pix[best, 1])))
        # Pair up contacts that are within direct edge-length on the skeleton.
        # Heuristic: connect each contact to its 2 nearest other contacts.
        for i, (ki, xi, yi) in enumerate(contacts):
            others = sorted(
                ((kj, math.hypot(xi-xj, yi-yj)) for j, (kj, xj, yj) in enumerate(contacts) if j != i),
                key=lambda t: t[1],
            )
            for kj, _ in others[:2]:
                a, b = (ki, kj) if ki < kj else (kj, ki)
                edge_set.add((a, b))
        multi_touch_count += 1
edges = sorted(edge_set)
print(f"edges from components: {len(edges)} (multi-touch: {multi_touch_count}, unmatched: {unmatched_count})")

# Optional: drop edges whose line passes too near a third node — usually unnecessary
# with skeleton-based extraction since each component already respects topology.

# ---------- Bridge nearby separate components (recover missed inner edges) ----------
def find_components(node_count, edge_list):
    a = defaultdict(set)
    for (i, j) in edge_list:
        a[i].add(j); a[j].add(i)
    comps = []
    seen = set()
    for s in range(node_count):
        if s in seen: continue
        c = set(); stk = [s]
        while stk:
            n = stk.pop()
            if n in seen: continue
            seen.add(n); c.add(n)
            for nb in a[n]:
                if nb not in seen: stk.append(nb)
        comps.append(c)
    return sorted(comps, key=len, reverse=True)

components = find_components(len(nodes_px), edges)
print(f"initial components: {[len(c) for c in components[:8]]}")

# Bridge: connect each non-main component to the closest node in the main one
# by adding the geometrically-shortest available connection. Skeleton extraction
# normally handles inner-ring connections, but the bright character glow can
# blot out a few central edges; this recovers them.
main = components[0] if components else set()
edge_set = set(edges)
bridges_added = 0
for c in components[1:]:
    if len(c) < 3: continue
    best = None
    best_d = float('inf')
    for i in c:
        for j in main:
            d = math.hypot(nodes_px[i][0]-nodes_px[j][0], nodes_px[i][1]-nodes_px[j][1])
            if 22 < d < 160 and d < best_d:
                best_d = d; best = (min(i, j), max(i, j))
    if best:
        edge_set.add(best); bridges_added += 1
edges = sorted(edge_set)
print(f"bridges added: {bridges_added}")

components = find_components(len(nodes_px), edges)
keep_set = set()
for c in components:
    if len(c) >= 5:
        keep_set |= c
print(f"components after bridges: {[len(c) for c in components[:8]]}; kept: {len(keep_set)}")
keep = sorted(keep_set)
old_to_new = {old: new for new, old in enumerate(keep)}
nodes_px = [nodes_px[k] for k in keep]
edges = [(old_to_new[i], old_to_new[j]) for (i, j) in edges if i in old_to_new and j in old_to_new]
active_indices = {old_to_new[k] for k in active_indices if k in old_to_new}
print(f"after pruning small components: {len(nodes_px)} nodes, {len(edges)} edges")

# ---------- Classify node types ----------
types = ["minor"] * len(nodes_px)
for k in active_indices:
    types[k] = "active"

# Pick the 6 starts: scan all nodes by angle, picking the closest-to-hub node
# per ~60° sector. Snap them to a regular hexagon at average radius so the
# renderer's green start circle sits exactly under them.
all_with_angle = []
for k, (x, y, _) in enumerate(nodes_px):
    d = math.hypot(x - cx, y - cy)
    a = math.atan2(y - cy, x - cx)
    sector = int(((a + math.pi/2 + math.pi*2) % (math.pi*2)) / (math.pi/3)) % 6
    all_with_angle.append((k, d, sector))

start_ids = [None] * 6
for s in range(6):
    candidates = [(k, d) for (k, d, sec) in all_with_angle if sec == s]
    if candidates:
        candidates.sort(key=lambda t: t[1])
        start_ids[s] = candidates[0][0]
# Drop any unfilled (shouldn't happen with 198 nodes but safe)
start_ids = [k for k in start_ids if k is not None]
print(f"start nodes picked: {start_ids} (sectors filled: {len(start_ids)}/6)")

# Snap to a regular hexagon at the average radius of detected starts
if start_ids:
    avg_r = sum(math.hypot(nodes_px[k][0]-cx, nodes_px[k][1]-cy) for k in start_ids) / len(start_ids)
    # Match per-sector index (start_ids preserves sector order 0..5 if all filled)
    for s, k in enumerate(start_ids):
        a = (math.pi*2 * s) / 6 - math.pi/2
        _, _, r = nodes_px[k]
        nodes_px[k] = (int(cx + math.cos(a) * avg_r), int(cy + math.sin(a) * avg_r), r)
        types[k] = "start"

# Active: warm/orange surrounding patch
for k, (x, y, r) in enumerate(nodes_px):
    if types[k] == "start": continue
    pad = max(8, r)
    patch = hsv[max(0,y-pad):y+pad+1, max(0,x-pad):x+pad+1]
    if patch.size == 0: continue
    warm = cv2.inRange(patch, (10, 80, 130), (35, 255, 255))
    if warm.mean() > 50:
        types[k] = "active"

# Major: top 18% of remaining minors by detected radius
remaining = [k for k in range(len(nodes_px)) if types[k] == "minor"]
remaining.sort(key=lambda k: -nodes_px[k][2])
for k in remaining[:max(15, len(remaining)//6)]:
    types[k] = "major"

# ---------- Debug overlay ----------
dbg = img.copy()
cv2.circle(dbg, (cx, cy), 12, (0, 0, 255), 3)
type_colors = {"start": (0, 255, 255), "minor": (255, 255, 255), "major": (0, 200, 0), "active": (0, 165, 255)}
for k, (x, y, r) in enumerate(nodes_px):
    cv2.circle(dbg, (x, y), max(r, 6), type_colors[types[k]], 2)
for (i, j) in edges:
    cv2.line(dbg, nodes_px[i][:2], nodes_px[j][:2], (0, 255, 0), 1)
cv2.imwrite(str(DEBUG_DIR / "detections.png"), dbg)

# Also save intermediates for inspection
cv2.imwrite(str(DEBUG_DIR / "tophat.png"), tophat)
cv2.imwrite(str(DEBUG_DIR / "blob_mask.png"), blob_mask)

# ---------- Emit JSON ----------
out_nodes = [{
    "id": k+1,
    "dx": round((x - cx) * WORLD_SCALE),
    "dy": round((y - cy) * WORLD_SCALE),
    "nodeType": types[k],
    "name": f"Node {k+1}",
    "description": "",
    "maxRank": 1 if types[k] in ("start", "active") else 3,
} for k, (x, y, r) in enumerate(nodes_px)]
out_edges = [{"from": i+1, "to": j+1} for (i, j) in edges]

OUT_JSON.write_text(json.dumps({
    "class": "Paladin",
    "accentColor": "#e8c432",
    "center": {"x": 0, "y": 0},
    "nodes": out_nodes,
    "connections": out_edges,
}))

print(f"wrote {OUT_JSON} ({len(out_nodes)} nodes, {len(out_edges)} edges)")
print("counts:", {t: types.count(t) for t in ["start", "minor", "major", "active"]})
