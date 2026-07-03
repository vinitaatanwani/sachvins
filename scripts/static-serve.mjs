import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// Serves the static landing page (landing/) exactly as Vercel's static hosting would.
const root = path.join(import.meta.dirname, "..", "landing");
const port = 4173;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const filePath = urlPath === "/" ? "/index.html" : urlPath;
    const fullPath = path.join(root, filePath);
    if (!fullPath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(fullPath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Landing preview on http://localhost:${port}`));
