"""
BeastBurst API monitor — runs a local web dashboard at http://localhost:4932
that probes every known endpoint every 5 minutes.

Run:
    python scripts/api-monitor.py

The dashboard auto-opens in your browser. New endpoints that flip from 404 to
200 are highlighted. Ctrl+C in the terminal to stop.

No external deps — reads BEASTBURST_API_TOKEN from wip/.env.local.
"""
import http.server
import json
import socketserver
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from datetime import datetime
from pathlib import Path

PORT = 4932
INTERVAL = 5 * 60
API_BASE = "https://developers.beastburst.com/api/community"
ENDPOINTS = [
    "/items",
    # Classes
    "/classes", "/class", "/character-classes", "/playable-classes",
    # Talents
    "/talents", "/talent-trees", "/passives", "/specs", "/specializations",
    # Skills & abilities
    "/skills", "/abilities", "/spells", "/actives",
    # Races & factions
    "/races", "/factions",
    # Professions & crafting
    "/professions", "/recipes", "/crafting",
    # Creatures & NPCs
    "/mobs", "/monsters", "/creatures", "/bosses", "/npcs", "/characters",
    # World
    "/quests", "/missions", "/zones", "/maps", "/areas", "/regions", "/locations",
]

ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local"
TOKEN = None
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith("BEASTBURST_API_TOKEN="):
            TOKEN = line.split("=", 1)[1].strip().strip('"').strip("'")

state = {
    "last_run": None,
    "results": {},        # endpoint -> {"code": int, "count": int|None, "delta": int|None}
    "started": datetime.now().isoformat(timespec="seconds"),
}


def probe_once():
    prev_results = state.get("results", {})
    new_results = {}
    for ep in ENDPOINTS:
        url = API_BASE + ep
        code = -1
        count = None
        try:
            req = urllib.request.Request(url, headers={
                "Authorization": f"Bearer {TOKEN}",
                "X-API-Version": "2.0.0",
                "Accept": "application/json",
                "User-Agent": "ScarsHQ-API-Monitor/1.0",
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.status
                try:
                    data = json.loads(resp.read())
                    if isinstance(data, dict):
                        meta = data.get("meta") or {}
                        if isinstance(meta, dict) and isinstance(meta.get("total"), int):
                            count = meta["total"]
                        elif isinstance(data.get("data"), list):
                            count = len(data["data"])
                    elif isinstance(data, list):
                        count = len(data)
                except Exception:
                    pass
        except urllib.error.HTTPError as e:
            code = e.code
        except Exception:
            code = -1
        prev = prev_results.get(ep) or {}
        prev_count = prev.get("count")
        delta = None
        if isinstance(count, int) and isinstance(prev_count, int):
            delta = count - prev_count
        new_results[ep] = {"code": code, "count": count, "delta": delta}
    state["results"] = new_results
    state["last_run"] = datetime.now().isoformat(timespec="seconds")
    summary = " ".join(
        f"{ep}:{r['code']}" + (f"({r['count']}{'+' if (r['delta'] or 0) > 0 else ''}{r['delta']})" if r['delta'] else (f"({r['count']})" if r['count'] is not None else ""))
        for ep, r in new_results.items()
    )
    print(f"[{state['last_run']}] {summary}")


def background_loop():
    while True:
        time.sleep(INTERVAL)
        try:
            probe_once()
        except Exception as e:
            print(f"[probe error] {e}")


HTML = """<!doctype html>
<html><head><title>BeastBurst API Monitor</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: dark; }
  body { background:#0c0c14; color:#e8e8e8; font-family:system-ui,-apple-system,sans-serif; padding:32px; max-width:680px; margin:0 auto; }
  h1 { color:#e8c432; margin:0 0 8px; font-size:22px; letter-spacing:.5px; }
  .meta { color:#888; font-size:13px; margin-bottom:28px; }
  .meta strong { color:#bbb; font-weight:500; }
  table { border-collapse:collapse; width:100%; }
  td, th { padding:11px 14px; text-align:left; border-bottom:1px solid #1e1e28; }
  th { color:#666; font-weight:500; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; }
  .ok { color:#5fc46e; font-weight:600; }
  .bad { color:#5a5a64; }
  .err { color:#c46e5f; }
  .new td { background:#5fc46e14; }
  .new .ok::after { content:" ← new"; color:#5fc46e; font-weight:400; font-size:11px; }
  code { font-family:Consolas,Menlo,monospace; }
  button { background:#e8c432; color:#1a1a22; border:0; padding:9px 18px; font-size:13px; font-weight:600; border-radius:5px; cursor:pointer; margin-bottom:18px; }
  button:hover { background:#f4d445; }
  button:disabled { background:#3a3a44; color:#888; cursor:wait; }
  .delta { font-weight:600; padding:2px 6px; border-radius:3px; font-size:12px; }
  .delta.up { background:#5fc46e22; color:#5fc46e; }
  .delta.down { background:#c46e5f22; color:#c46e5f; }
  footer { margin-top:32px; color:#444; font-size:11px; }
</style></head>
<body>
<h1>BeastBurst API Monitor</h1>
<p class="meta">
  Probing every 5 min · Started <strong id="started">—</strong> · Last run <strong id="last">—</strong>
</p>
<button id="now" onclick="checkNow()">Check now</button>
<table>
  <thead><tr><th>Endpoint</th><th>Status</th><th>Count</th><th>Δ</th></tr></thead>
  <tbody id="rows"></tbody>
</table>
<footer>localhost:4932 · refresh every 5s · Ctrl+C terminal to stop</footer>
<script>
  const known200 = new Set(['/items']);
  async function refresh() {
    try {
      const r = await fetch('/state.json');
      const s = await r.json();
      document.getElementById('started').textContent = s.started || '—';
      document.getElementById('last').textContent = s.last_run || '—';
      const tb = document.getElementById('rows');
      tb.innerHTML = '';
      Object.entries(s.results).forEach(([ep, r]) => {
        const code = r.code;
        const tr = document.createElement('tr');
        const cls = code === 200 ? 'ok' : code === -1 ? 'err' : 'bad';
        const isNew = code === 200 && !known200.has(ep);
        if (isNew) tr.className = 'new';
        const countCell = r.count != null ? r.count.toLocaleString() : '—';
        let deltaCell = '';
        if (typeof r.delta === 'number' && r.delta !== 0) {
          const sign = r.delta > 0 ? '+' : '';
          deltaCell = `<span class="delta ${r.delta > 0 ? 'up' : 'down'}">${sign}${r.delta}</span>`;
        }
        tr.innerHTML = `<td><code>GET ${ep}</code></td><td class="${cls}">${code === -1 ? 'ERR' : code}</td><td>${countCell}</td><td>${deltaCell}</td>`;
        tb.appendChild(tr);
      });
    } catch (e) { /* server probably stopped */ }
  }
  async function checkNow() {
    const btn = document.getElementById('now');
    btn.disabled = true; btn.textContent = 'Checking…';
    try { await fetch('/probe', { method: 'POST' }); await refresh(); }
    finally { btn.disabled = false; btn.textContent = 'Check now'; }
  }
  refresh();
  setInterval(refresh, 5000);
</script>
</body></html>
"""


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args, **kwargs): pass
    def do_GET(self):
        if self.path == "/state.json":
            body = json.dumps(state).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        body = HTML.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_POST(self):
        if self.path == "/probe":
            try:
                probe_once()
                body = json.dumps(state).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                msg = json.dumps({"error": str(e)}).encode()
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(msg)))
                self.end_headers()
                self.wfile.write(msg)
            return
        self.send_response(404)
        self.end_headers()


def main():
    if not TOKEN:
        raise SystemExit(f"BEASTBURST_API_TOKEN not found in {ENV_FILE}")
    print(f"BeastBurst API Monitor → http://localhost:{PORT}")
    print(f"Probing {len(ENDPOINTS)} endpoints every {INTERVAL}s. Ctrl+C to stop.")
    probe_once()
    threading.Thread(target=background_loop, daemon=True).start()
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
