// เซิร์ฟเวอร์ทดสอบบนเครื่อง ใช้ตรรกะ hub.js ตัวเดียวกับที่รันบน Cloudflare
// ที่เก็บไฟล์เป็นหน่วยความจำ (หายเมื่อปิดเซิร์ฟเวอร์) และชำระเงินเป็นโหมดทดลองเสมอ ถ้าไม่ตั้ง PAY_MODE=off
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Hub } from '../src/hub.js';
import { memFiles, serveFile } from '../src/files.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
const mem = new Map();
const files = process.env.NO_FILES ? null : memFiles();
const hub = new Hub({
  get: async (k) => (mem.has(k) ? JSON.parse(mem.get(k)) : undefined),
  put: async (k, v) => { mem.set(k, JSON.stringify(v)); },
  delete: async (k) => { mem.delete(k); },
  list: async (prefix) => [...mem.keys()].filter((k) => k.startsWith(prefix)).map((k) => [k, JSON.parse(mem.get(k))])
}, {
  pay: { mode: process.env.PAY_MODE === 'off' ? 'off' : 'demo' }, files,
  admin: { all: !!process.env.ADMIN_ALL, codes: String(process.env.ADMIN_CODES || '').split(/[\s,;]+/).filter(Boolean) }
});
await hub.load();

// แปลงคำขอของ Node เป็น Request มาตรฐาน (เก็บ content-length ไว้ให้ hub ตรวจขนาดส่วนอัปโหลด)
async function toRequest(req) {
  const url = 'http://' + (req.headers.host || 'localhost') + req.url;
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const chunks = [];
  if (hasBody) for await (const c of req) chunks.push(c);
  const body = hasBody ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string' && k !== 'host') headers.set(k, v);
  if (hasBody && body.length) headers.set('content-length', String(body.length));
  return new Request(url, { method: req.method, headers, body: hasBody && body.length ? body : undefined });
}
async function send(res, r) {
  res.statusCode = r.status;
  r.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(r.body ? Buffer.from(await r.arrayBuffer()) : undefined);
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (u.pathname === '/api/turn') {
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ iceServers: [] }));
    }
    if (u.pathname.startsWith('/api/up/') || u.pathname === '/api/stripe-webhook') return send(res, await hub.http(await toRequest(req)));
    if (u.pathname.startsWith('/f/')) return send(res, await serveFile(await toRequest(req), files));
    const f = path.join(root, u.pathname === '/' ? 'index.html' : u.pathname);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream');
    fs.createReadStream(f).pipe(res);
  } catch (e) {
    res.statusCode = 500; res.end('error ' + e.message);
  }
});
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, sock, head) => {
  if (new URL(req.url, 'http://x').pathname !== '/ws') return sock.destroy();
  wss.handleUpgrade(req, sock, head, (ws) => hub.connect(ws, { ip: '', origin: 'http://' + req.headers.host }));
});
const port = +process.env.PORT || 8788;
server.listen(port, () => console.log('test server on http://localhost:' + port));
