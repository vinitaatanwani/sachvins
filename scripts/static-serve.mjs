import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const port = 4173;

const mimeTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

http
  .createServer((req, res) => {
    const filePath = req.url === "/" ? "/the-clarity-method.html" : req.url;
    const fullPath = path.join(root, filePath);
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
  .listen(port, () => console.log(`Static preview server on http://localhost:${port}`));
