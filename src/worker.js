// จุดเข้าของ Cloudflare Worker: ส่งต่อ /ws ไปยัง Durable Object ตัวเดียวที่ถือบัญชี เซิร์ฟเวอร์ และห้องทั้งหมด
import { Hub, PRO } from './hub.js';
import { Stripe, verifyWebhook } from './stripe.js';
import { r2Files, serveFile } from './files.js';

const STUN = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
const json = (o, status = 200) => new Response(JSON.stringify(o), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});

// ระบบชำระเงิน: PAY_MODE = off (ปิด) | demo (จำลอง ไม่ตัดเงินจริง) | stripe  ถ้าไม่ตั้งค่า: มี STRIPE_SECRET_KEY → stripe ไม่มี → demo
function payFor(env) {
  const want = String(env.PAY_MODE || '').toLowerCase();
  if (want === 'off') return { mode: 'off' };
  if (want !== 'demo' && env.STRIPE_SECRET_KEY) {
    const secret = env.STRIPE_WEBHOOK_SECRET;
    return {
      mode: 'stripe',
      stripe: new Stripe(env.STRIPE_SECRET_KEY, { plans: PRO.plans, coupon: PRO.coupon, pct: PRO.discPct }),
      verify: secret ? (raw, header) => verifyWebhook(raw, header, secret) : null
    };
  }
  return { mode: 'demo' };
}

// ผู้ดูแลเว็บ: ตั้งตัวแปร ADMIN_CODES เป็นรหัสเพื่อน 6 ตัวของบัญชีที่ต้องการ (คั่นด้วยจุลภาคได้หลายคน) เช่น 35RDD9,K3M7QX
function adminFor(env) {
  return { codes: String(env.ADMIN_CODES || '').split(/[\s,;]+/).filter(Boolean) };
}

export class HubDO {
  constructor(state, env) {
    this.hub = new Hub({
      get: (k) => state.storage.get(k),
      put: (k, v) => state.storage.put(k, v),
      delete: (k) => state.storage.delete(k),
      list: async (prefix) => [...(await state.storage.list({ prefix })).entries()]
    }, { pay: payFor(env), files: env.FILES ? r2Files(env.FILES) : null, admin: adminFor(env) });
    state.blockConcurrencyWhile(() => this.hub.load());
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/up/') || url.pathname === '/api/stripe-webhook') return this.hub.http(request);
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('ต้องเชื่อมต่อแบบ WebSocket', { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.hub.connect(server, { ip: request.headers.get('CF-Connecting-IP') || '', origin: url.origin });
    return new Response(null, { status: 101, webSocket: client });
  }
}

// รายชื่อเซิร์ฟเวอร์ช่วยเชื่อมต่อ ถ้าตั้งค่า TURN ไว้จะใช้ด้วย (ช่วยคนที่อยู่หลังเครือข่ายที่ต่อตรงไม่ได้)
async function iceServers(env) {
  if (!env.TURN_KEY_ID || !env.TURN_API_TOKEN) return STUN;
  try {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TURN_API_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ ttl: 86400 })
    });
    if (!r.ok) return STUN;
    const j = await r.json();
    const list = Array.isArray(j.iceServers) ? j.iceServers : j.iceServers ? [j.iceServers] : [];
    return list.length ? STUN.concat(list) : STUN;
  } catch (e) {
    return STUN;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      // รับเฉพาะการเชื่อมต่อที่มาจากหน้าเว็บของเราเอง
      const origin = request.headers.get('Origin');
      if (origin) {
        let host = '';
        try { host = new URL(origin).host; } catch (e) { /* ปล่อยให้ตกไปปฏิเสธ */ }
        if (host !== url.host) return new Response('ไม่อนุญาต', { status: 403 });
      }
      return env.HUB.get(env.HUB.idFromName('main')).fetch(request);
    }

    if (url.pathname === '/api/turn') return json({ iceServers: await iceServers(env) });

    // อัปโหลดไฟล์ และ webhook ของ Stripe ให้ Durable Object ตัวเดียวกับที่ถือบัญชีเป็นคนตรวจสิทธิ์
    if (url.pathname.startsWith('/api/up/') || url.pathname === '/api/stripe-webhook') return env.HUB.get(env.HUB.idFromName('main')).fetch(request);

    // ดาวน์โหลด/เปิดดูไฟล์แนบ อ่านจาก R2 ตรงๆ (ไม่ผ่าน Durable Object จะได้ไม่ขวางแชต)
    if (url.pathname.startsWith('/f/')) return serveFile(request, env.FILES ? r2Files(env.FILES) : null);

    return env.ASSETS.fetch(request);
  }
};
