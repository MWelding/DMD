import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exhibits } from './src/content.js';

export function createServer({ production = false } = {}) {
  const root = resolve(fileURLToPath(new URL('.', import.meta.url)), production ? 'dist' : 'public');
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok' })); }
      if (url.pathname === '/api/exhibits') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(req.method === 'HEAD' ? undefined : JSON.stringify(exhibits)); }
      const sourceRequest = !production && url.pathname.startsWith('/src/');
      const allowedRoot = sourceRequest ? resolve(root, '../src') : root;
      const requestedPath = sourceRequest ? url.pathname.slice(4) : url.pathname === '/' ? '/index.html' : url.pathname;
      const path = resolve(allowedRoot, '.' + decodeURIComponent(requestedPath));
      if (!path.startsWith(allowedRoot + sep)) { res.writeHead(403); return res.end('Forbidden'); }
      if (!(await stat(path)).isFile()) throw new Error('Not a file');
      const data = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': production ? 'public, max-age=3600' : 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer({ production: process.argv.includes('--production') }).listen(port, '127.0.0.1', () => console.log(`Change in Progress → http://127.0.0.1:${port}`));
}
