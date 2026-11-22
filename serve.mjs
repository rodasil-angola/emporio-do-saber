// Servidor local simples para pré-visualizar dist/ (node serve.mjs → http://localhost:5173)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain" };
const port = Number(process.env.PORT) || 5173;

createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([\\/])+/, "");
  let file = join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" }).end(data);
  } catch {
    if (!extname(p) && !p.endsWith("/")) { res.writeHead(301, { Location: "/" + p + "/" }).end(); return; }
    res.writeHead(404, { "Content-Type": "text/plain" }).end("404");
  }
}).listen(port, () => console.log("http://localhost:" + port));
