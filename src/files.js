// ที่เก็บไฟล์แนบและตัวส่งไฟล์ออก (GET /f/<id>)  ใช้ร่วมกันระหว่าง Cloudflare R2, เซิร์ฟเวอร์ทดสอบ และตัวอย่างในเบราว์เซอร์
// รูปแบบของที่เก็บ (adapter):
//   put(key, body, meta, len) · begin(key, meta) -> {uploadId} · part(key, uploadId, n, body, len) -> {etag}
//   complete(key, uploadId, parts) · abort(key, uploadId) · read(key, offset, length) -> Uint8Array
//   get(key, range) -> {body, size, meta, range} หรือ null · delete(key)

const TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4'
};
export const extOf = (name) => { const m = /\.([A-Za-z0-9]{1,8})$/.exec(String(name || '')); return m ? m[1].toLowerCase() : ''; };
export const kindOf = (name) => { const t = TYPES[extOf(name)] || ''; return t.startsWith('image/') ? 'image' : t.startsWith('video/') ? 'video' : t.startsWith('audio/') ? 'audio' : 'file'; };

// ไฟล์ที่เบราว์เซอร์เปิดดูในหน้าได้อย่างปลอดภัย (รูป วิดีโอ เสียง) ส่งแบบ inline  ที่เหลือทั้งหมดบังคับดาวน์โหลด
// ประเภทไฟล์ตัดสินจากนามสกุลที่เซิร์ฟเวอร์เก็บไว้ ไม่เชื่อค่าที่ผู้ส่งแจ้งมา กัน HTML/SVG ปลอมตัวมาเป็นรูป
function parseRange(h, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(h || '');
  if (!m || (!m[1] && !m[2])) return null;
  let a, b;
  if (!m[1]) { a = Math.max(0, size - Math.min(+m[2], size)); b = size - 1; } else { a = +m[1]; b = m[2] ? Math.min(+m[2], size - 1) : size - 1; }
  if (a > b || a >= size) return 'bad';
  return { offset: a, length: b - a + 1 };
}

export async function serveFile(request, files) {
  const nf = () => new Response('ไม่พบไฟล์', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  const m = /^\/f\/([a-z0-9]{16})$/.exec(new URL(request.url).pathname);
  if (!m || !files) return nf();
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('method', { status: 405 });
  const key = 'f/' + m[1];
  // ต้องรู้ขนาดทั้งไฟล์ก่อนถึงจะแปลง Range แบบ "-N" ได้ จึงขอข้อมูลโดยไม่ระบุช่วงถ้าเป็นรูปแบบนั้น
  const hdr = request.headers.get('range');
  let rng = null;
  const quick = /^bytes=(\d+)-(\d*)$/.exec(hdr || '');
  if (quick) rng = quick[2] ? { offset: +quick[1], length: +quick[2] - +quick[1] + 1 } : { offset: +quick[1] };
  else if (/^bytes=-\d+$/.test(hdr || '')) rng = { suffix: +hdr.slice(7) };
  let r;
  try { r = await files.get(key, rng); } catch (e) { return new Response('range', { status: 416 }); }
  if (!r) return nf();
  const meta = r.meta || {};
  const ext = extOf(meta.name);
  const type = TYPES[ext];
  const safeName = String(meta.name || 'file').replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const h = new Headers({
    'content-type': type || 'application/octet-stream',
    'content-disposition': (type ? 'inline' : 'attachment') + '; filename="' + safeName + '"; filename*=UTF-8\'\'' + encodeURIComponent(meta.name || 'file'),
    'x-content-type-options': 'nosniff',
    'content-security-policy': "default-src 'none'; sandbox",
    'cross-origin-resource-policy': 'same-origin',
    'accept-ranges': 'bytes',
    'cache-control': 'private, max-age=3600'
  });
  let status = 200;
  if (r.range && (rng || hdr)) {
    status = 206;
    h.set('content-range', 'bytes ' + r.range.offset + '-' + (r.range.offset + r.range.length - 1) + '/' + r.size);
    h.set('content-length', String(r.range.length));
  } else h.set('content-length', String(r.size));
  return new Response(request.method === 'HEAD' ? null : r.body, { status, headers: h });
}

// ที่เก็บบน Cloudflare R2 (binding ชื่อ FILES)
export const r2Files = (b) => ({
  put: (key, body, meta) => b.put(key, body, { customMetadata: meta }),
  begin: async (key, meta) => ({ uploadId: (await b.createMultipartUpload(key, { customMetadata: meta })).uploadId }),
  part: async (key, id, n, body) => ({ etag: (await b.resumeMultipartUpload(key, id).uploadPart(n, body)).etag }),
  complete: (key, id, parts) => b.resumeMultipartUpload(key, id).complete(parts),
  abort: (key, id) => b.resumeMultipartUpload(key, id).abort(),
  read: async (key, offset, length) => { const o = await b.get(key, { range: { offset, length } }); return o ? new Uint8Array(await o.arrayBuffer()) : null; },
  get: async (key, range) => {
    const o = await b.get(key, range ? { range } : undefined);
    if (!o) return null;
    let rg = null;
    if (range && o.range) {
      const off = o.range.offset != null ? o.range.offset : o.size - (o.range.suffix || 0);
      rg = { offset: off, length: o.range.length != null ? o.range.length : o.size - off };
    }
    return { body: o.body, size: o.size, meta: o.customMetadata || {}, range: rg };
  },
  delete: (key) => b.delete(key)
});

// ที่เก็บจำลองในหน่วยความจำ (ไว้ทดสอบและตัวอย่างในเบราว์เซอร์)
export function memFiles() {
  const objs = new Map(); // key -> { bytes: Uint8Array, meta }
  const mp = new Map(); // uploadId -> { key, meta, parts: Map }
  const bytesOf = async (body) => new Uint8Array(await new Response(body).arrayBuffer());
  const api = {
    objs,
    put: async (key, body, meta) => { objs.set(key, { bytes: await bytesOf(body), meta }); },
    begin: async (key, meta) => { const id = 'mp' + Math.random().toString(36).slice(2); mp.set(id, { key, meta, parts: new Map() }); return { uploadId: id }; },
    part: async (key, id, n, body) => { const u = mp.get(id); if (!u || u.key !== key) throw new Error('no upload'); const b = await bytesOf(body); u.parts.set(n, b); return { etag: 'e' + n + '-' + b.length }; },
    complete: async (key, id, parts) => {
      const u = mp.get(id); if (!u) throw new Error('no upload');
      const list = parts.map((p) => { const b = u.parts.get(p.partNumber); if (!b || p.etag !== 'e' + p.partNumber + '-' + b.length) throw new Error('bad part'); return b; });
      const out = new Uint8Array(list.reduce((n, b) => n + b.length, 0));
      let o = 0; list.forEach((b) => { out.set(b, o); o += b.length; });
      objs.set(key, { bytes: out, meta: u.meta }); mp.delete(id);
    },
    abort: async (key, id) => { mp.delete(id); },
    read: async (key, offset, length) => { const o = objs.get(key); return o ? o.bytes.slice(offset, offset + length) : null; },
    get: async (key, range) => {
      const o = objs.get(key);
      if (!o) return null;
      const size = o.bytes.length;
      let rg = null;
      if (range) {
        const off = range.suffix != null ? Math.max(0, size - range.suffix) : range.offset;
        if (off >= size) throw new Error('range');
        const len = range.suffix != null ? size - off : Math.min(range.length != null ? range.length : size - off, size - off);
        rg = { offset: off, length: len };
      }
      const slice = rg ? o.bytes.slice(rg.offset, rg.offset + rg.length) : o.bytes;
      return { body: slice, size, meta: o.meta, range: rg };
    },
    delete: async (key) => { objs.delete(key); }
  };
  return api;
}
