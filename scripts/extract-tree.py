#!/usr/bin/env python3
"""
Extract talent tree topology from a screenshot.

Setup (once):
    pip install opencv-python numpy

Usage:
    python scripts/extract-tree.py paladin path/to/screenshot.png
    python scripts/extract-tree.py paladin shot.png --debug

The --debug flag writes an annotated overlay to public/data/talents/_debug/.
Open it side-by-side with the original to spot missed nodes or bad edges,
then re-run with tuned --min-radius / --max-radius / --line-threshold.
"""

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np


CLASS_ACCENTS = {
    "warrior": "#c84f3a",
    "paladin": "#e8c432",
    "ranger": "#5fa14a",
    "assassin": "#9c5cb6",
    "pirate": "#d18b3e",
    "mage": "#4a8ff7",
    "priest": "#e9d8a6",
    "druid": "#7bb866",
    "necromancer": "#7d3a8b",
    "mystic": "#3aa8b4",
}


def detect_circles(gray, min_r, max_r, param2):
    blurred = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=int(min_r * 1.6),
        param1=80,
        param2=param2,
        minRadius=min_r,
        maxRadius=max_r,
    )
    if circles is None:
        return []
    return [(int(x), int(y), int(r), False) for x, y, r in circles[0]]


def detect_squares(gray, min_r, max_r):
    edges = cv2.Canny(gray, 60, 180)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area, max_area = (min_r * 2) ** 2, (max_r * 2.4) ** 2
    out = []
    for cnt in contours:
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
        if len(approx) != 4:
            continue
        area = cv2.contourArea(cnt)
        if not (min_area <= area <= max_area):
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        if not (0.85 < w / max(h, 1) < 1.15):
            continue
        out.append((x + w // 2, y + h // 2, max(w, h) // 2, True))
    return out


def deduplicate(nodes, min_dist):
    kept = []
    for n in sorted(nodes, key=lambda x: -x[2]):
        if all(((n[0] - k[0]) ** 2 + (n[1] - k[1]) ** 2) ** 0.5 > min_dist for k in kept):
            kept.append(n)
    return kept


def classify_round_node(radius, all_round_radii):
    if not all_round_radii:
        return "minor"
    p40, p75 = np.percentile(all_round_radii, [40, 75])
    if radius >= p75:
        return "keystone"
    if radius >= p40:
        return "major"
    return "minor"


def detect_start_nodes(nodes, cx, cy, count=6):
    """The 6 nodes closest to the hub center are the starting nodes."""
    by_dist = sorted(range(len(nodes)), key=lambda i: (nodes[i][0] - cx) ** 2 + (nodes[i][1] - cy) ** 2)
    return set(by_dist[:count])


def detect_lines(gray, threshold, min_length):
    edges = cv2.Canny(gray, 40, 130)
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=threshold,
        minLineLength=min_length,
        maxLineGap=8,
    )
    if lines is None:
        return []
    return [tuple(line[0]) for line in lines]


def nearest_node(point, nodes, max_dist):
    px, py = point
    best_idx, best_d = -1, max_dist
    for i, (nx, ny, _, _) in enumerate(nodes):
        d = ((px - nx) ** 2 + (py - ny) ** 2) ** 0.5
        if d < best_d:
            best_d = d
            best_idx = i
    return best_idx


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("class_slug", help="Class name, e.g. paladin")
    parser.add_argument("image", help="Path to screenshot")
    parser.add_argument("--out", default=None, help="Override output JSON path")
    parser.add_argument("--debug", action="store_true", help="Save annotated overlay")
    parser.add_argument("--min-radius", type=int, default=14, help="Smallest expected node radius (px)")
    parser.add_argument("--max-radius", type=int, default=42, help="Largest expected node radius (px)")
    parser.add_argument("--line-threshold", type=int, default=45, help="Hough line vote threshold")
    parser.add_argument("--line-min-length", type=int, default=28, help="Minimum connection line length (px)")
    parser.add_argument("--mask-center", type=int, default=0, help="Ignore detections within N px of image center (avatar mask)")
    parser.add_argument("--circle-strictness", type=int, default=30, help="Circle detection threshold (higher = stricter, fewer false positives)")
    args = parser.parse_args()

    img = cv2.imread(args.image)
    if img is None:
        sys.exit(f"Could not read {args.image}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    cx, cy = w // 2, h // 2

    circles = detect_circles(gray, args.min_radius, args.max_radius, args.circle_strictness)
    squares = detect_squares(gray, args.min_radius, args.max_radius)

    if args.mask_center > 0:
        m2 = args.mask_center ** 2
        circles = [n for n in circles if (n[0] - cx) ** 2 + (n[1] - cy) ** 2 > m2]
        squares = [n for n in squares if (n[0] - cx) ** 2 + (n[1] - cy) ** 2 > m2]

    all_nodes = deduplicate(circles + squares, min_dist=int(args.min_radius * 1.5))

    if not all_nodes:
        sys.exit("No nodes detected. Tune --min-radius / --max-radius and re-run with --debug.")
    round_radii = [n[2] for n in all_nodes if not n[3]]
    start_indices = detect_start_nodes(all_nodes, cx, cy, count=6)

    nodes_json = []
    for i, (x, y, r, is_square) in enumerate(all_nodes):
        if is_square:
            nt = "active"
        elif i in start_indices:
            nt = "start"
        else:
            nt = classify_round_node(r, round_radii)
        nodes_json.append({
            "id": i + 1,
            "dx": x - cx,
            "dy": y - cy,
            "nodeType": nt,
            "name": f"Node {i + 1}",
            "description": "",
            "maxRank": 1 if nt in ("start", "active") else 3,
        })

    raw_lines = detect_lines(gray, args.line_threshold, args.line_min_length)
    seen = set()
    connections = []
    mask2 = args.mask_center ** 2
    for x1, y1, x2, y2 in raw_lines:
        if args.mask_center > 0:
            mx, my = (x1 + x2) // 2, (y1 + y2) // 2
            if (mx - cx) ** 2 + (my - cy) ** 2 < mask2:
                continue
        a = nearest_node((x1, y1), all_nodes, max_dist=args.max_radius * 1.4)
        b = nearest_node((x2, y2), all_nodes, max_dist=args.max_radius * 1.4)
        if a < 0 or b < 0 or a == b:
            continue
        key = (min(a, b), max(a, b))
        if key in seen:
            continue
        seen.add(key)
        connections.append({"from": a + 1, "to": b + 1})

    output = {
        "class": args.class_slug.capitalize(),
        "accentColor": CLASS_ACCENTS.get(args.class_slug.lower(), "#888888"),
        "center": {"x": 0, "y": 0},
        "nodes": nodes_json,
        "connections": connections,
    }

    if args.out:
        out_path = Path(args.out)
    else:
        out_path = Path(__file__).resolve().parent.parent / "public" / "data" / "talents" / f"{args.class_slug.lower()}.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output))
    print(f"Wrote {out_path} — {len(nodes_json)} nodes, {len(connections)} connections")

    if args.debug:
        overlay = img.copy()
        type_color = {
            "start": (0, 255, 0),
            "minor": (255, 200, 0),
            "major": (0, 165, 255),
            "keystone": (0, 0, 255),
            "active": (255, 0, 255),
        }
        for c in connections:
            a = nodes_json[c["from"] - 1]
            b = nodes_json[c["to"] - 1]
            cv2.line(overlay, (a["dx"] + cx, a["dy"] + cy), (b["dx"] + cx, b["dy"] + cy), (255, 255, 255), 1)
        for n in nodes_json:
            cv2.circle(overlay, (n["dx"] + cx, n["dy"] + cy), 20, type_color[n["nodeType"]], 2)
            cv2.putText(overlay, str(n["id"]), (n["dx"] + cx - 10, n["dy"] + cy + 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        debug_dir = out_path.parent / "_debug"
        debug_dir.mkdir(exist_ok=True)
        debug_path = debug_dir / f"{args.class_slug.lower()}-debug.png"
        cv2.imwrite(str(debug_path), overlay)
        print(f"Debug overlay: {debug_path}")


if __name__ == "__main__":
    main()
