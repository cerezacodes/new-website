from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(ROOT, ".env")


def parse_env(path):
    env = {}
    if not os.path.exists(path):
        return env

    with open(path, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip("\"'")
    return env


env = parse_env(ENV_PATH)
ADMIN_PASSWORD = env.get("ADMIN_PASSWORD", "")
WRITER_PASSWORD = env.get("WRITER_PASSWORD", "")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/validate-password":
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length else b"{}"

            try:
                payload = json.loads(raw.decode("utf-8") or "{}")
            except Exception:
                payload = {}

            ptype = str(payload.get("type", "")).strip().lower()
            password = str(payload.get("password", "")).strip()

            expected = ""
            if ptype == "admin":
                expected = ADMIN_PASSWORD
            elif ptype == "writer":
                expected = WRITER_PASSWORD

            ok = password == expected
            body = json.dumps({"ok": ok, "message": "Valid password" if ok else "Incorrect password"}).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": False, "message": "Not found"}).encode("utf-8"))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/validate-password":
            self.send_response(405)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "message": "Method not allowed"}).encode("utf-8"))
            return

        return SimpleHTTPRequestHandler.do_GET(self)


if __name__ == "__main__":
    os.chdir(ROOT)
    port = 8000
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving Lights Out on http://127.0.0.1:{port}")
    print(f"Password API: http://127.0.0.1:{port}/api/validate-password")
    httpd.serve_forever()
