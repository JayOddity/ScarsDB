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
    "/items", "/classes", "/skills", "/talents", "/abilities",
    "/mobs", "/npcs", "/quests", "/zones", "/maps",
]

ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local"
TOKEN = None
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith("BEASTBURST_API_TOKEN="):
            TOKEN = line.split("=", 1)[1].strip().strip('"').strip("'")

state = {"last_run": None, "results": {}, "items_total": None, "started": datetime.now().isoformat(timespec="seconds")}


def probe_once():
    new_results = {}
    for ep in ENDPOINTS:
        url = API_BASE + ep
        code = -1
        try:
            req = urllib.request.Request(url, headers={
                "Authorization": f"Bearer {TOKEN}",
                "X-API-Version": "2.0.0",
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.status
                if ep == "/items":
                    try:
                        data = json.loads(resp.read())
                        state["items_total"] = data.get("meta", {}).get("total")
                    except Exception:
                        pass
        except urllib.error.HTTPError as e:
            code = e.code
        except Exception:
            code = -1
        new_results[ep] = code
    state["results"] = new_results
    state["last_run"] = datetime.now().isoformat(timespec="seconds")
    print(f"[{state['last_run']}] " + " ".join(f"{ep}:{c}" for ep, c in new_results.items()))


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
  footer { margin-top:32px; color:#444; font-size:11px; }
</style></head>
<body>
<h1>BeastBurst API Monitor</h1>
<p class="meta">
  Probing every 5 min · Started <strong id="started">—</strong> · Last run <strong id="last">—</strong> · /items total <strong id="total">—</strong>
</p>
<table>
  <thead><tr><th>Endpoint</th><th>Status</th></tr></thead>
  <tbody id="rows"></tbody>
</table>
<footer>localhost:4932 · refresh every 5s · Ctrl+C terminal to stop</footer>
<script>
  const known404 = new Set(['/classes','/skills','/talents','/abilities','/mobs','/npcs','/quests','/zones','/maps']);
  async function refresh() {
    try {
      const r = await fetch('/state.json');
      const s = await r.json();
      document.getElementById('started').textContent = s.started || '—';
      document.getElementById('last').textContent = s.last_run || '—';
      document.getElementById('total').textContent = s.items_total ?? '—';
      const tb = document.getElementById('rows');
      tb.innerHTML = '';
      Object.entries(s.results).forEach(([ep, code]) => {
        const tr = document.createElement('tr');
        const cls = code === 200 ? 'ok' : code === -1 ? 'err' : 'bad';
        const isNew = code === 200 && known404.has(ep);
        if (isNew) tr.className = 'new';
        tr.innerHTML = `<td><code>GET ${ep}</code></td><td class="${cls}">${code === -1 ? 'ERR' : code}</td>`;
        tb.appendChild(tr);
      });
    } catch (e) { /* server probably stopped */ }
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
