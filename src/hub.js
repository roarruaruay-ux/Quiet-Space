// ตรรกะของ QuietSpace v3: บัญชีผู้ใช้ เซิร์ฟเวอร์หลายอัน ช่องข้อความ/เสียง เพื่อน แชตส่วนตัว สถานะ และส่งต่อสัญญาณ WebRTC
// ไฟล์นี้ไม่ผูกกับแพลตฟอร์ม ใช้ได้ทั้งบน Cloudflare Durable Object และ Node (ไว้ทดสอบ)
//
// หลักการสำคัญ: cid เป็นรหัสลับของแต่ละคน (เก็บในเครื่องเขา) ห้ามส่งให้ใครเด็ดขาด
// ส่วน uid เป็นรหัสสาธารณะที่ใช้อ้างอิงผู้ใช้ในข้อความ รายชื่อ และเพื่อน

const HATS = ['none', 'beanie', 'sprout', 'phones', 'catears', 'cap', 'flower', 'straw'];
const STYLES = ['short', 'bob', 'long', 'bun', 'ponytail', 'spiky', 'curly', 'bald'];
const OUTFITS = ['tee', 'hoodie', 'stripe', 'overalls', 'dress', 'jacket'];
const ACCS = ['none', 'scarf', 'bowtie', 'backpack', 'pin'];
const FRAMES = ['none', 'leaf', 'gold', 'royal', 'sakura', 'ocean', 'ice', 'fire', 'neon', 'galaxy', 'rainbow', 'vine', 'catears', 'bunny', 'halo', 'devil'];
// ของตกแต่งสำหรับสมาชิก Pro เท่านั้น (ฝั่งเซิร์ฟเวอร์ตัดทิ้งถ้าไม่ได้เป็นสมาชิก ไม่ใช่แค่ซ่อนปุ่มในหน้าเว็บ)
const PRO_HATS = ['crown', 'wizard', 'antlers', 'halo', 'bunnyears', 'headband'];
const PRO_STYLES = ['mohawk', 'twintail', 'afro', 'braid'];
const PRO_OUTFITS = ['suit', 'kimono', 'armor', 'astro'];
const PRO_ACCS = ['cape', 'wings', 'headset', 'medal'];
const PRO_FRAMES = ['aurora', 'sunset', 'diamond', 'pixel', 'storm', 'lotus', 'prism', 'crown'];
const EYES = ['round', 'oval', 'sleepy', 'happy', 'star'];
const BROWS = ['none', 'soft', 'angry', 'sad'];
const MOUTHS = ['smile', 'flat', 'open', 'cat'];
const PATTERNS = ['none', 'stripes', 'dots', 'check'];
const STATUSES = ['online', 'idle', 'dnd', 'invisible'];
const SRV_EMOJI = ['🌱', '🌿', '🍃', '📚', '☕', '🎧', '🎮', '🎨', '🎵', '🌙', '⭐', '🔥', '🐱', '🐶', '🦊', '🐼', '🌸', '🍜', '💻', '✏️', '🚀', '🏠', '⚽', '🎬'];
const COLOR = /^#[0-9a-fA-F]{6}$/;
const MOODS = ['เงียบมาก', 'คุยเบาๆ ได้', 'เสียงฝนและเพลงเบาๆ'];
const REACTS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀', '🌱', '☕'];
const MAIN = 'main';
const CODE_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_ALPHA = 'abcdefghijklmnopqrstuvwxyz0123456789';
// แพ็กเกจสมาชิก: ราคาเป็นบาท  ส่วนลด 10% เมื่อใช้งานจริงครบ 100 ชั่วโมง (ลดทุกรอบบิลตราบที่ยังสมัครอยู่)
export const PRO = {
  plans: { month: { thb: 89, days: 30, interval: 'month', key: 'qs_month_89', label: 'รายเดือน' }, year: { thb: 799, days: 365, interval: 'year', key: 'qs_year_799', label: 'รายปี' } },
  discPct: 10, discMs: 100 * 3600 * 1000, coupon: 'qs_loyal10'
};
export const priceSatang = (plan, disc) => Math.round(PRO.plans[plan].thb * 100 * (disc ? 100 - PRO.discPct : 100) / 100);
const UP_PART = 32 * 1024 * 1024; // ขนาดต่อส่วนของการอัปโหลดแบบ multipart (R2 ต้อง >= 5 MiB ยกเว้นส่วนสุดท้าย)
const SHARE_CAPS = { free: { w: 1280, h: 720, fps: 15, kbps: 1500 }, pro: { w: 1920, h: 1080, fps: 30, kbps: 5000 } };
const LIMITS = {
  freeFile: 10 * 1024 * 1024, glbMax: 25 * 1024 * 1024, maxParts: 10000, upPending: 3, upGapMs: 500, upTtlMs: 2 * 3600 * 1000, fileName: 120,
  chatKeep: 200, chatLen: 1000, chatGapMs: 400, typingGapMs: 1500, logChars: 52000,
  reactKinds: 12, msgBytes: 24000, picsPerReq: 30,
  chMain: 60, chOther: 40, srvOwn: 5, srvJoin: 30, srvMembers: 300, memList: 400,
  friends: 200, pending: 50, blocked: 100, dms: 60, users: 20000, newPerIpHour: 8, logsCached: 300
};
const SEED_CH = [
  { id: 'general', type: 'text', name: 'ทั่วไป', desc: 'คุยเล่น ทักทายกันได้ที่นี่', owner: null },
  { id: 'intro', type: 'text', name: 'แนะนำตัว', desc: 'ทักทายเพื่อนใหม่ บอกว่าวันนี้กำลังทำอะไรอยู่', owner: null },
  { id: 'welcome', type: 'voice', name: 'ห้องต้อนรับ', desc: 'ทักทายกันเบาๆ ได้ที่นี่', mood: 'คุยเบาๆ ได้', cap: 8, owner: null },
  { id: 'study', type: 'voice', name: 'ห้องอ่านหนังสือเงียบๆ', desc: 'ไม่ต้องคุยกัน ปิดไมค์ไว้ก็ได้', mood: 'เงียบมาก', cap: 8, owner: null }
];

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
// ข้อความแชต เก็บการขึ้นบรรทัดใหม่ไว้ ตัดอักขระควบคุมอื่นทิ้ง
const cleanMsg = (s) => String(s == null ? '' : s)
  .replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
  .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, LIMITS.chatLen);
const PIC_PRESET = /^p:[a-z]{1,12}$/;
const PIC_DATA = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]{20,14000}$/;
const cleanPic = (v) => (typeof v === 'string' && (PIC_PRESET.test(v) || PIC_DATA.test(v)) ? v : '');
const isData = (v) => typeof v === 'string' && v.startsWith('data:');
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const rnd = (n, alpha) => {
  let out = '';
  const g = typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues;
  const buf = new Uint32Array(n);
  if (g) globalThis.crypto.getRandomValues(buf); else for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 4294967296);
  for (let i = 0; i < n; i++) out += alpha[buf[i] % alpha.length];
  return out;
};
const num = (v, lo, hi, d) => { v = +v; return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
// ตัวสร้างอวตารขั้นสูง (เฉพาะ Pro): ปรับสัดส่วน หน้าตา ลวดลายเสื้อ และออร่า
const cleanAdv = (a) => {
  a = a || {};
  const col = (v) => (COLOR.test(v) ? v : '');
  return {
    hs: num(a.hs, 0.85, 1.25, 1), bh: num(a.bh, 0.88, 1.12, 1), bw: num(a.bw, 0.88, 1.18, 1),
    eye: EYES.includes(a.eye) ? a.eye : 'round', eyec: COLOR.test(a.eyec) ? a.eyec : '#1f2a24',
    brow: BROWS.includes(a.brow) ? a.brow : 'none', mouth: MOUTHS.includes(a.mouth) ? a.mouth : 'smile',
    blush: col(a.blush), hair2: col(a.hair2), pat: PATTERNS.includes(a.pat) ? a.pat : 'none', pat2: COLOR.test(a.pat2) ? a.pat2 : '#ffffff',
    aura: col(a.aura)
  };
};
const pick = (list, proList, v, d, pro) => (list.includes(v) || (pro && proList.includes(v)) ? v : d);
// pro = true: ยอมรับของ Pro ด้วย  (ค่าที่เก็บในฐานข้อมูลเก็บแบบเต็ม เวลาแสดงผลจะกรองอีกชั้นด้วย eff())
const cleanCfg = (c, pro) => {
  c = c || {};
  const col = (v, d) => (COLOR.test(v) ? v : d);
  const out = {
    skin: col(c.skin, '#f6d6b8'),
    shirt: col(c.shirt, '#2f8f4e'),
    hair: col(c.hair, '#2b1d16'),
    hat: pick(HATS, PRO_HATS, c.hat, 'none', pro),
    style: pick(STYLES, PRO_STYLES, c.style, 'short', pro),
    outfit: pick(OUTFITS, PRO_OUTFITS, c.outfit, 'tee', pro),
    acc: pick(ACCS, PRO_ACCS, c.acc, 'none', pro),
    trim: col(c.trim, '#f2e6b8'),
    glasses: !!c.glasses,
    frame: pick(FRAMES, PRO_FRAMES, c.frame, 'none', pro),
    pic: cleanPic(c.pic),
    adv: pro && c.adv ? cleanAdv(c.adv) : null,
    useGlb: !!(pro && c.useGlb),
    glb: ''
  };
  return out;
};
const cleanIcon = (i) => {
  i = i || {};
  return { e: SRV_EMOJI.includes(i.e) ? i.e : '🌱', c: COLOR.test(i.c) ? i.c : '#2f8f4e' };
};
const cleanCode = (s) => String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^QS(?=[A-Z0-9]{6,8}$)/, '').slice(0, 12);
const presetOf = (u) => (u.cfg.pic.startsWith('p:') ? u.cfg.pic : '');
const dmKey = (a, b) => 'dm:' + [a, b].sort().join('.');
const without = (arr, v) => { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); return arr; };

export class Hub {
  // storage: { get(key), put(key, value), delete(key), list(prefix) -> [[key, value], ...] } เป็น async ทั้งหมด
  // opts.pay   = { mode: 'demo' | 'stripe' | 'off', stripe: ตัวเรียก Stripe (ถ้ามี), verify(raw, header) -> event }
  // opts.files = ที่เก็บไฟล์ (R2 หรือจำลอง) ถ้าไม่มีจะปิดการอัปโหลดไฟล์
  // opts.admin = { codes: [รหัสเพื่อนของผู้ดูแลเว็บ], all: ทุกคนเป็นผู้ดูแล (ใช้เฉพาะหน้าตัวอย่าง/ทดสอบ) } ผู้ดูแลเว็บลบห้องของเซิร์ฟเวอร์กลางได้
  constructor(storage, opts) {
    opts = opts || {};
    this.pay = { mode: 'demo', stripe: null, verify: null, ...(opts.pay || {}) };
    if (this.pay.mode === 'stripe' && !this.pay.stripe) this.pay.mode = 'off';
    this.files = opts.files || null;
    const ad = opts.admin || {};
    this.adm = { all: !!ad.all, codes: new Set((ad.codes || []).map((x) => String(x).trim().toUpperCase()).filter(Boolean)) };
    this.ups = new Map(); // fid -> บันทึกการอัปโหลดที่กำลังทำอยู่ / ยังไม่ได้แนบกับข้อความ
    this.subChk = new Map(); // uid -> เวลาที่ตรวจสถานะสมาชิกกับ Stripe ล่าสุด
    this.proSeen = new Map(); // uid -> สถานะ Pro ล่าสุดที่แจ้งคนอื่นไปแล้ว (ไว้จับตอนหมดอายุตามเวลา)
    this.lastSweep = 0;
    this.st = storage;
    this.users = new Map(); // uid -> ผู้ใช้
    this.cidIdx = new Map(); // cid ลับ -> uid
    this.codeIdx = new Map(); // รหัสเพื่อน -> uid
    this.servers = new Map(); // sid -> เซิร์ฟเวอร์
    this.invIdx = new Map(); // รหัสเชิญ -> sid
    this.chIdx = new Map(); // id ช่อง -> sid
    this.clients = new Map(); // id การเชื่อมต่อ -> client
    this.byUid = new Map(); // uid -> Set ของ client ที่ออนไลน์
    this.logs = new Map(); // key เก็บข้อความ -> Promise ของอาเรย์ข้อความ
    this.newByIp = new Map();
    this.seq = 0;
    this.timer = null;
    this.srvTimer = null;
    this.dirty = this.freshDirty();
  }

  freshDirty() { return { srv: new Set(), pres: false, soc: new Set(), mem: new Set() }; }

  /* ---------- โหลดและย้ายข้อมูลเก่า ---------- */
  async load() {
    if ((await this.st.get('ver')) !== 3) await this.migrate();
    for (const [, u] of await this.st.list('u:')) this.indexUser(u);
    for (const [, s] of await this.st.list('srv:')) this.indexServer(s);
    if (!this.servers.has(MAIN)) {
      const s = this.makeServer({ id: MAIN, main: true, name: 'QuietSpace', icon: { e: '🌱', c: '#2f8f4e' }, owner: null, channels: SEED_CH.map((c) => ({ ...c })) });
      await this.saveServer(s);
    }
    await this.sweepUploads();
  }

  indexUser(u) {
    u.cfg = cleanCfg(u.cfg, true);
    if (!(u.usedMs >= 0)) u.usedMs = 0;
    if (!(u.lastUse >= 0)) u.lastUse = 0;
    u.usedSaved = u.usedMs;
    ['friends', 'inReq', 'outReq', 'blocked', 'servers'].forEach((k) => { if (!Array.isArray(u[k])) u[k] = []; });
    if (!u.dms || typeof u.dms !== 'object') u.dms = {};
    if (!STATUSES.includes(u.status)) u.status = 'online';
    this.users.set(u.uid, u);
    this.cidIdx.set(u.cid, u.uid);
    this.codeIdx.set(u.code, u.uid);
  }

  indexServer(s) {
    if (!Array.isArray(s.members)) s.members = [];
    if (!Array.isArray(s.channels)) s.channels = [];
    s.mset = new Set(s.members);
    this.servers.set(s.id, s);
    this.invIdx.set(s.code, s.id);
    s.channels.forEach((c) => this.chIdx.set(c.id, s.id));
  }

  // ข้อมูลรุ่นเก่า (v2) มีห้องเดียวและใช้ cid เป็นตัวระบุสาธารณะ แปลงเป็นเซิร์ฟเวอร์ "QuietSpace" + บัญชีผู้ใช้
  async migrate() {
    for (const [k] of await this.st.list('u:')) await this.st.delete(k);
    for (const [k] of await this.st.list('srv:')) await this.st.delete(k);
    const saved = await this.st.get('rooms');
    const rooms = saved && saved.length ? saved.map((r) => ({ ...r, type: r.type || 'voice' })) : SEED_CH.map((c) => ({ ...c }));
    const byCid = new Map();
    const used = new Set();
    const adopt = (cid, name, shirt, pic) => {
      if (!cid) return null;
      let u = byCid.get(cid);
      if (!u) {
        let uid;
        do { uid = 'u' + rnd(10, ID_ALPHA); } while (used.has(uid));
        used.add(uid);
        u = {
          uid, cid: String(cid).slice(0, 64), code: '', name: clean(name, 20) || 'ผู้ใช้',
          cfg: cleanCfg({ shirt, pic: cleanPic(pic) && !isData(pic) ? pic : '' }), pv: '', status: 'online',
          created: Date.now(), seen: 0, friends: [], inReq: [], outReq: [], blocked: [], dms: {}, servers: [MAIN]
        };
        byCid.set(cid, u);
      } else if (name) u.name = clean(name, 20) || u.name;
      return u;
    };
    const logs = [];
    for (const r of rooms) {
      const log = await this.st.get('chat:' + r.id);
      if (!Array.isArray(log)) continue;
      for (const m of log) {
        if (m.cid) { const u = adopt(m.cid, m.name, m.s, m.p); m.uid = u.uid; delete m.cid; }
        if (m.reply && m.reply.cid) { const u = adopt(m.reply.cid, m.reply.name); m.reply.uid = u.uid; delete m.reply.cid; }
        if (m.react) for (const e of Object.keys(m.react)) m.react[e] = m.react[e].map((c) => { const u = adopt(c, ''); return u ? u.uid : ''; }).filter(Boolean);
      }
      logs.push([r.id, log]);
    }
    rooms.forEach((r) => { if (r.owner) r.owner = adopt(r.owner, '').uid; });
    const codes = new Set();
    for (const u of byCid.values()) {
      do { u.code = rnd(6, CODE_ALPHA); } while (codes.has(u.code));
      codes.add(u.code);
    }
    const main = {
      id: MAIN, main: true, name: 'QuietSpace', icon: { e: '🌱', c: '#2f8f4e' }, owner: null, created: Date.now(),
      code: rnd(8, CODE_ALPHA), members: [...byCid.values()].map((u) => u.uid), channels: rooms
    };
    for (const u of byCid.values()) await this.st.put('u:' + u.uid, u);
    await this.st.put('srv:' + MAIN, main);
    for (const [id, log] of logs) await this.st.put('chat:' + id, log);
    await this.st.put('ver', 3);
  }

  /* ---------- ฟังก์ชันช่วย ---------- */
  userRec(u) { const r = { ...u, cfg: { ...u.cfg, pic: isData(u.cfg.pic) ? '' : u.cfg.pic } }; delete r.usedSaved; return r; }

  /* ---------- สมาชิก Pro ---------- */
  isPro(u) { const s = u.sub; return !!(s && s.status !== 'canceled' && s.until > Date.now()); }
  // รูปลักษณ์ที่แสดงให้คนอื่นเห็นจริง: ถ้าไม่ได้เป็นสมาชิกอยู่ ของ Pro จะถูกตัดออก (ค่าที่เลือกไว้ยังเก็บอยู่ ต่ออายุแล้วกลับมา)
  eff(u) {
    if (!this.isPro(u)) return cleanCfg(u.cfg, false);
    return { ...u.cfg, glb: u.cfg.useGlb && u.glb ? u.glb.id : '' };
  }
  discOk(u) { return (u.usedMs || 0) >= PRO.discMs; }
  priceTable() {
    const o = {};
    for (const k of Object.keys(PRO.plans)) o[k] = { base: PRO.plans[k].thb, disc: priceSatang(k, true) / 100, days: PRO.plans[k].days };
    return o;
  }
  payInfo() {
    return {
      mode: this.pay.mode, prices: this.priceTable(), discPct: PRO.discPct, discHours: PRO.discMs / 3600000,
      upload: !!this.files, freeFile: LIMITS.freeFile, glbMax: LIMITS.glbMax, share: SHARE_CAPS,
      pro: { hats: PRO_HATS, styles: PRO_STYLES, outfits: PRO_OUTFITS, accs: PRO_ACCS, frames: PRO_FRAMES }
    };
  }
  meFor(u) {
    const s = u.sub;
    return {
      uid: u.uid, code: u.code, name: u.name, cfg: this.eff(u), status: u.status, pro: this.isPro(u),
      usedMs: u.usedMs || 0, disc: this.discOk(u),
      sub: s ? { plan: s.plan, status: s.status, until: s.until, cancel: !!s.cancel, demo: !!s.demo, disc: !!s.disc, active: this.isPro(u) } : null,
      glb: u.glb ? { id: u.glb.id, name: u.glb.name, size: u.glb.size } : null,
      admin: this.isAdmin(u)
    };
  }
  pushMe(u) { this.conns(u.uid).forEach((x) => this.send(x, { t: 'me', me: this.meFor(u) })); }
  // นับเวลาใช้งานจริงของผู้ใช้ (ไม่เกินเวลาจริงที่ผ่านไป และหลายแท็บไม่นับซ้อน)
  use(u, now) {
    const d = now - (u.lastUse || 0);
    if (d < 10000) return;
    u.lastUse = now;
    const before = u.usedMs || 0;
    u.usedMs = before + Math.min(d, 40000);
    if (u.usedMs - (u.usedSaved || 0) >= 300000) { u.usedSaved = u.usedMs; this.saveUser(u).catch(() => {}); }
    if (before < PRO.discMs && u.usedMs >= PRO.discMs) { this.saveUser(u).catch(() => {}); this.pushMe(u); this.maybeDiscount(u); }
  }
  // คนที่สมัครไปแล้วแต่เพิ่งใช้ครบ 100 ชม. ทีหลัง ก็ได้ส่วนลดตั้งแต่รอบบิลถัดไป
  async maybeDiscount(u) {
    const s = u.sub;
    if (!s || s.disc || !this.isPro(u) || !this.discOk(u)) return;
    try {
      if (!s.demo) {
        if (!this.pay.stripe || !s.subId) return;
        await this.pay.stripe.discount(s.subId);
      }
      if (u.sub) u.sub.disc = true; // ใช้ u.sub ล่าสุด เผื่อระหว่างรอ Stripe มีการดึงสถานะมาแทนที่ไปแล้ว
      await this.saveUser(u);
      this.pushMe(u);
    } catch (e) { /* ไว้ลองใหม่รอบหน้า */ }
  }
  applySub(u, sub) {
    const was = this.isPro(u);
    const ok = ['active', 'trialing', 'past_due'].includes(sub.status);
    const item = sub.items && sub.items.data && sub.items.data[0];
    const end = ((sub.current_period_end || (item && item.current_period_end)) || 0) * 1000;
    const md = sub.metadata || {};
    const old = u.sub || {};
    const cp = (d) => !!d && (d.coupon === PRO.coupon || (d.coupon && d.coupon.id === PRO.coupon));
    const hasCoupon = cp(sub.discount) || (Array.isArray(sub.discounts) && sub.discounts.some(cp));
    u.sub = {
      plan: PRO.plans[md.plan] ? md.plan : (PRO.plans[old.plan] ? old.plan : 'month'), status: sub.status,
      until: ok ? end : Math.min(old.until || 0, Date.now()), cancel: !!(sub.cancel_at_period_end || sub.cancel_at),
      demo: false, disc: md.disc === '1' || !!old.disc || hasCoupon, cus: typeof sub.customer === 'object' && sub.customer ? sub.customer.id : sub.customer,
      subId: sub.id, since: old.since || Date.now()
    };
    return was !== this.isPro(u);
  }
  async afterSubChange(u) {
    await this.saveUser(u);
    this.pushMe(u);
    this.proTransition(u);
  }
  // สถานะ Pro เปลี่ยน (สมัคร/หมดอายุ) → ให้ทุกคนเห็นรูปลักษณ์ใหม่ทันที  ใช้จับกรณีหมดอายุตามเวลาด้วย
  proTransition(u) {
    const p = this.isPro(u);
    if (this.proSeen.get(u.uid) === p) return;
    this.proSeen.set(u.uid, p);
    this.pushMe(u); this.touchProfile(u); this.refreshLooks(u);
  }
  refreshLooks(u) {
    const v = this.conns(u.uid).find((x) => x.room);
    if (v) this.members(v.room).forEach((x) => { if (x.user !== u) this.send(x, { t: 'peer-update', peer: this.pub(v) }); });
  }
  // ตรวจสถานะสมาชิก: โหมดทดลองต่ออายุเองจนกว่าจะยกเลิก  ส่วน Stripe ถามจาก Stripe ถ้าใกล้หมดอายุหรือไม่ได้ตรวจนาน
  async refreshSub(u, force) {
    const s = u.sub;
    if (!s) return;
    const now = Date.now();
    if (s.demo) {
      if (s.until <= now && s.status === 'active') {
        if (s.cancel) s.status = 'canceled';
        else { const step = PRO.plans[s.plan].days * 86400000; while (s.until <= now) s.until += step; }
        await this.afterSubChange(u);
      }
      return;
    }
    if (!this.pay.stripe || !s.subId) return;
    const last = this.subChk.get(u.uid) || 0;
    if (!force && now - last < (s.until <= now + 60000 ? 600000 : 6 * 3600000)) return;
    this.subChk.set(u.uid, now);
    try {
      const sub = await this.pay.stripe.getSub(s.subId);
      { this.applySub(u, sub); await this.afterSubChange(u); }
    } catch (e) { /* ติดต่อ Stripe ไม่ได้ครั้งนี้ ลองใหม่ภายหลัง */ }
  }
  async stripeEvent(evt) {
    const o = (evt && evt.data && evt.data.object) || {};
    let id = '';
    switch (evt && evt.type) {
      case 'checkout.session.completed': id = o.subscription; break;
      case 'customer.subscription.created': case 'customer.subscription.updated': case 'customer.subscription.deleted': id = o.id; break;
      case 'invoice.paid': case 'invoice.payment_succeeded': case 'invoice.payment_failed':
        id = o.subscription || (o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription); break;
      default: return;
    }
    if (id && typeof id === 'object') id = id.id;
    if (!id) return;
    const sub = await this.pay.stripe.getSub(id); // ดึงข้อมูลล่าสุดจาก Stripe แทนการเชื่อ payload ในอีเวนต์
    const u = this.users.get(sub.metadata && sub.metadata.uid);
    if (!u) return;
    { this.applySub(u, sub); await this.afterSubChange(u); }
  }
  saveUser(u) { return this.st.put('u:' + u.uid, this.userRec(u)); }
  saveServer(s) { const r = { ...s }; delete r.mset; return this.st.put('srv:' + s.id, r); }
  // เวลาข้อความล่าสุดของช่องเก็บในเซิร์ฟเวอร์ (บันทึกแบบหน่วงเวลา ไม่ต้องเขียนทุกข้อความ)
  saveServersLater() {
    if (this.srvTimer) return;
    this.srvTimer = setTimeout(() => { this.srvTimer = null; this.servers.forEach((s) => { this.saveServer(s).catch(() => {}); }); }, 5000);
  }

  newFriendCode() { let c; do { c = rnd(6, CODE_ALPHA); } while (this.codeIdx.has(c)); return c; }
  newInvite() { let c; do { c = rnd(8, CODE_ALPHA); } while (this.invIdx.has(c)); return c; }

  makeServer({ id, main, name, icon, owner, channels }) {
    const s = {
      id: id || 's' + rnd(9, ID_ALPHA), main: !!main, name, icon: cleanIcon(icon), owner, created: Date.now(),
      code: this.newInvite(), members: [], channels: []
    };
    s.mset = new Set();
    this.servers.set(s.id, s);
    this.invIdx.set(s.code, s.id);
    channels.forEach((c) => { s.channels.push(c); this.chIdx.set(c.id, s.id); });
    return s;
  }

  newChannelId() { return 'c' + rnd(9, ID_ALPHA); }

  addMember(s, u) {
    if (s.mset.has(u.uid)) return;
    s.mset.add(u.uid); s.members.push(u.uid);
    if (!u.servers.includes(s.id)) u.servers.push(s.id);
  }
  removeMember(s, u) {
    s.mset.delete(u.uid); without(s.members, u.uid); without(u.servers, s.id);
    this.conns(u.uid).forEach((c) => { if (c.vs === s.id) this.leaveVoice(c); });
  }

  conns(uid) { const s = this.byUid.get(uid); return s ? [...s] : []; }
  members(roomId) { return [...this.clients.values()].filter((x) => x.room === roomId); }
  pub(x) { return { id: x.id, uid: x.user.uid, name: x.user.name, cfg: this.eff(x.user), cam: x.cam, mic: x.mic, scr: x.scr, rd: x.rd || 0, pro: this.isPro(x.user) }; }
  card(p) { return { uid: p.uid, name: p.name, shirt: p.cfg.shirt, pic: presetOf(p), pv: p.pv, frame: this.eff(p).frame, pro: this.isPro(p) }; }
  shareServer(a, b) { return a.servers.some((id) => { const s = this.servers.get(id); return s && s.mset.has(b.uid); }); }
  canDM(a, b) {
    if (a === b || b.blocked.includes(a.uid) || a.blocked.includes(b.uid)) return false;
    return a.friends.includes(b.uid) || this.shareServer(a, b);
  }
  rate(c, key, ms) { const t = Date.now(); if (t - (c.rl[key] || 0) < ms) return false; c.rl[key] = t; return true; }
  err(c, code, msg, extra) { this.send(c, { t: 'error', code, msg, ...(extra || {}) }); }

  getLog(key) {
    let p = this.logs.get(key);
    if (!p) {
      p = this.st.get(key).then((v) => (Array.isArray(v) ? v : []));
      this.logs.set(key, p);
      if (this.logs.size > LIMITS.logsCached) this.logs.delete(this.logs.keys().next().value);
    }
    return p;
  }
  trim(log) {
    const gone = [];
    while (log.length > LIMITS.chatKeep) gone.push(log.shift());
    if (log.length > 20) {
      let n = JSON.stringify(log).length;
      while (n > LIMITS.logChars && log.length > 1) { const x = log.shift(); gone.push(x); n -= JSON.stringify(x).length + 1; }
    }
    this.dropFiles(gone);
  }
  // ลบไฟล์แนบของข้อความที่หายไปแล้ว (ถูกลบ / เลื่อนหลุดจากประวัติ / ช่องถูกลบ) จะได้ไม่เปลืองที่เก็บ
  dropFiles(list) {
    if (!this.files) return;
    for (const m of list) if (m && m.file && m.file.id) Promise.resolve(this.files.delete('f/' + m.file.id)).catch(() => {});
  }
  async purgeLog(key) {
    if (!this.files) return;
    try { this.dropFiles(await this.getLog(key)); } catch (e) { /* ข้าม */ }
  }
  persist(key, log) { return this.st.put(key, log); }
  lastTs(key) { return 0; }

  /* ---------- มุมมองที่ส่งให้ client ---------- */
  chView(ch, s, u) {
    const voice = ch.type === 'voice';
    const ms = voice ? this.members(ch.id) : [];
    return {
      id: ch.id, type: ch.type, name: ch.name, desc: ch.desc || '', mood: ch.mood || '', cap: ch.cap || 0,
      count: ms.length, last: ch.last || 0,
      members: ms.map((x) => ({
        id: x.id, uid: x.user.uid, name: x.user.name, mic: x.mic, cam: x.cam, scr: x.scr, rd: x.rd || 0,
        shirt: x.user.cfg.shirt, pic: presetOf(x.user), pv: x.user.pv, frame: this.eff(x.user).frame, pro: this.isPro(x.user)
      })),
      canDelete: this.canDelCh(s, ch, u) && s.channels.length > 1
    };
  }
  isAdmin(u) { return this.adm.all || this.adm.codes.has(u.code); }
  // ลบห้องได้: เจ้าของเซิร์ฟเวอร์ คนสร้างห้อง หรือผู้ดูแลเว็บ (เฉพาะเซิร์ฟเวอร์กลางที่ไม่มีเจ้าของ)
  canDelCh(s, ch, u) { return s.owner === u.uid || (!!ch.owner && ch.owner === u.uid) || (!!s.main && this.isAdmin(u)); }
  canMake(s, u) { return s.main || s.owner === u.uid; }
  serverView(s, u) {
    const own = s.owner === u.uid;
    return {
      id: s.id, name: s.name, icon: s.icon, owner: s.owner, mine: own, main: !!s.main, n: s.members.length,
      code: own || s.main ? s.code : '', canMake: this.canMake(s, u),
      channels: s.channels.map((ch) => this.chView(ch, s, u))
    };
  }
  serversFor(u) { return u.servers.map((id) => this.servers.get(id)).filter(Boolean).map((s) => this.serverView(s, u)); }

  presenceFor(me) {
    const out = [];
    for (const [uid, set] of this.byUid) {
      if (!set.size) continue;
      const u = this.users.get(uid);
      if (!u) continue;
      const self = uid === me.uid;
      if (!self && !(me.friends.includes(uid) || this.shareServer(me, u))) continue;
      let st = u.status;
      if (st === 'invisible' && !self) continue;
      const v = [...set].find((x) => x.room);
      out.push({ ...this.card(u), status: st, vs: v ? v.vs : '', vc: v ? v.room : '' });
    }
    return out;
  }

  socialFor(u) {
    const ids = new Set([...u.friends, ...u.inReq, ...u.outReq, ...u.blocked, ...Object.keys(u.dms)]);
    const profiles = {};
    ids.forEach((id) => { const p = this.users.get(id); if (p) profiles[id] = this.card(p); });
    return {
      friends: u.friends.slice(), inReq: u.inReq.slice(), outReq: u.outReq.slice(), blocked: u.blocked.slice(),
      dms: Object.keys(u.dms).map((uid) => ({ uid, last: u.dms[uid] })), profiles
    };
  }

  roster(s) {
    return s.members.slice(0, LIMITS.memList).map((uid) => this.users.get(uid)).filter(Boolean)
      .map((p) => ({ ...this.card(p), owner: s.owner === p.uid }));
  }

  /* ---------- การแจ้งอัปเดต (รวมแล้วส่งทีเดียว ไม่ถี่เกินไป) ---------- */
  schedule() { if (!this.timer) this.timer = setTimeout(() => this.flush(), 120); }
  touchSrv(sid) { if (sid) { this.dirty.srv.add(sid); this.schedule(); } }
  touchPres() { this.dirty.pres = true; this.schedule(); }
  touchSoc(...uids) { uids.forEach((x) => this.dirty.soc.add(x)); this.schedule(); }
  touchMem(sid) { if (sid) { this.dirty.mem.add(sid); this.schedule(); } }
  touchProfile(u) {
    this.touchPres();
    u.servers.forEach((sid) => { this.touchSrv(sid); this.touchMem(sid); });
    this.touchSoc(u.uid);
    for (const uid of this.byUid.keys()) {
      const v = this.users.get(uid);
      if (v && (v.friends.includes(u.uid) || v.inReq.includes(u.uid) || v.outReq.includes(u.uid) || v.blocked.includes(u.uid) || u.uid in v.dms)) this.dirty.soc.add(uid);
    }
    this.schedule();
  }
  flush() {
    this.timer = null;
    const d = this.dirty;
    this.dirty = this.freshDirty();
    for (const c of this.clients.values()) {
      if (!c.ready) continue;
      const u = c.user;
      if (d.srv.size && u.servers.some((id) => d.srv.has(id))) this.send(c, { t: 'servers', servers: this.serversFor(u) });
      if (d.pres) this.send(c, { t: 'presence', list: this.presenceFor(u) });
      if (d.soc.has(u.uid)) this.send(c, { t: 'social', ...this.socialFor(u) });
    }
    d.mem.forEach((sid) => {
      const s = this.servers.get(sid);
      if (s) s.mset.forEach((uid) => this.conns(uid).forEach((x) => this.send(x, { t: 'mdirty', sid })));
    });
  }
  pushServersTo(u) { this.conns(u.uid).forEach((x) => this.send(x, { t: 'servers', servers: this.serversFor(u) })); }

  /* ---------- การเชื่อมต่อ ---------- */
  // ผูก WebSocket หนึ่งตัวเข้ากับระบบ  meta.ip ใช้จำกัดการสร้างบัญชีใหม่รัวๆ (ถ้ารู้)
  connect(ws, meta) {
    const c = {
      id: 'p' + (++this.seq).toString(36) + Math.random().toString(36).slice(2, 6),
      ws, ip: (meta && meta.ip) || '', origin: (meta && meta.origin) || '', user: null, room: null, vs: '',
      cam: false, mic: false, scr: false, rd: 0, lastChat: 0, lastTyping: 0, ready: false, rl: {}
    };
    this.clients.set(c.id, c);
    if (Date.now() - this.lastSweep > 3600000) this.sweepUploads();
    ws.addEventListener('message', (e) => {
      const raw = typeof e.data === 'string' ? e.data : String(e.data);
      this.onMessage(c, raw).catch(() => {});
    });
    ws.addEventListener('close', () => this.drop(c));
    ws.addEventListener('error', () => this.drop(c));
    return c;
  }

  send(c, o) { try { c.ws.send(JSON.stringify(o)); } catch (e) { /* ปลายทางหลุดไปแล้ว */ } }

  leaveVoice(c) {
    if (!c.room) return;
    const id = c.room, sid = c.vs;
    c.room = null; c.vs = ''; c.cam = false; c.mic = false; c.scr = false; c.rd = 0;
    this.members(id).forEach((x) => this.send(x, { t: 'peer-left', id: c.id }));
    this.touchSrv(sid); this.touchPres();
  }

  drop(c) {
    if (!this.clients.has(c.id)) return;
    this.leaveVoice(c);
    this.clients.delete(c.id);
    if (c.user) {
      const set = this.byUid.get(c.user.uid);
      if (set) {
        set.delete(c);
        if (!set.size) {
          this.byUid.delete(c.user.uid);
          c.user.seen = Date.now();
          c.user.usedSaved = c.user.usedMs;
          this.saveUser(c.user).catch(() => {});
          if (isData(c.user.cfg.pic)) c.user.cfg.pic = ''; // รูปที่อัปโหลดเก็บในที่เก็บ ไม่ค้างในหน่วยความจำของคนออฟไลน์
        }
      }
    }
    this.touchPres();
  }

  allowNewUser(c) {
    if (this.users.size >= LIMITS.users) return false;
    if (!c.ip) return true;
    const t = Date.now();
    const arr = (this.newByIp.get(c.ip) || []).filter((x) => t - x < 3600000);
    if (arr.length >= LIMITS.newPerIpHour) { this.newByIp.set(c.ip, arr); return false; }
    arr.push(t); this.newByIp.set(c.ip, arr);
    if (this.newByIp.size > 5000) this.newByIp.delete(this.newByIp.keys().next().value);
    return true;
  }

  async setProfile(u, name, cfg) {
    const old = u.pv;
    u.name = clean(name, 20) || u.name;
    const cf = cleanCfg(cfg, this.isPro(u));
    if (!this.isPro(u)) { cf.adv = u.cfg.adv || null; cf.useGlb = !!u.cfg.useGlb; } // ไม่ใช่สมาชิก: คงค่า Pro เดิมไว้ (ไม่แสดงผล) เผื่อกลับมาต่ออายุ
    const data = isData(cf.pic) ? cf.pic : '';
    u.cfg = cf;
    u.pv = data ? hash(data) : '';
    if (data && u.pv !== old) await this.st.put('pic:' + u.uid, data);
    else if (!data && old) await this.st.delete('pic:' + u.uid);
    await this.saveUser(u);
  }

  async loadPic(u) {
    if (u.pv && !isData(u.cfg.pic)) {
      const d = await this.st.get('pic:' + u.uid);
      if (isData(d)) u.cfg.pic = d;
    }
  }

  // บริบทของบทสนทนา: ช่องในเซิร์ฟเวอร์ หรือแชตส่วนตัว ('d:<uid>')
  ctxOf(c, room) {
    const u = c.user;
    if (typeof room !== 'string') return null;
    if (room.startsWith('d:')) {
      const peer = this.users.get(room.slice(2));
      if (!peer || peer === u) return null;
      return {
        kind: 'dm', key: dmKey(u.uid, peer.uid), peer, ok: this.canDM(u, peer), mod: false,
        targets: (fn) => {
          this.conns(u.uid).forEach((x) => fn(x, 'd:' + peer.uid));
          this.conns(peer.uid).forEach((x) => fn(x, 'd:' + u.uid));
        }
      };
    }
    const sid = this.chIdx.get(room);
    const s = sid && this.servers.get(sid);
    if (!s || !s.mset.has(u.uid)) return null;
    const ch = s.channels.find((x) => x.id === room);
    if (!ch) return null;
    return {
      kind: 'ch', key: 'chat:' + room, srv: s, ch, ok: true, mod: s.owner === u.uid,
      targets: (fn) => s.mset.forEach((uid) => this.conns(uid).forEach((x) => fn(x, room)))
    };
  }

  /* ---------- เพื่อน ---------- */
  notify(u, o) { this.conns(u.uid).forEach((x) => this.send(x, { t: 'notice', ...o })); }
  friendReq(c, a, b) {
    if (!b) return this.err(c, 'nf', 'ไม่พบผู้ใช้จากรหัสนี้ ตรวจรหัสอีกครั้ง');
    if (a === b) return this.err(c, 'self', 'นี่คือรหัสของคุณเอง');
    if (a.friends.includes(b.uid)) return this.err(c, 'dup', 'เป็นเพื่อนกันอยู่แล้ว');
    if (a.blocked.includes(b.uid)) return this.err(c, 'blk', 'คุณบล็อกคนนี้อยู่ ปลดบล็อกก่อนจึงจะเพิ่มเพื่อนได้');
    if (b.blocked.includes(a.uid)) return this.send(c, { t: 'ok', what: 'friend-sent', name: b.name }); // ไม่บอกว่าถูกบล็อก
    if (a.inReq.includes(b.uid)) return this.friendAccept(c, a, b);
    if (a.outReq.includes(b.uid)) return this.err(c, 'dup', 'ส่งคำขอไปแล้ว รอเขาตอบรับ');
    if (a.friends.length >= LIMITS.friends) return this.err(c, 'many', 'มีเพื่อนครบจำนวนสูงสุดแล้ว');
    if (a.outReq.length >= LIMITS.pending || b.inReq.length >= LIMITS.pending) return this.err(c, 'many', 'คำขอที่รออยู่เยอะเกินไป');
    a.outReq.push(b.uid); b.inReq.push(a.uid);
    this.saveUser(a); this.saveUser(b);
    this.touchSoc(a.uid, b.uid);
    this.send(c, { t: 'ok', what: 'friend-sent', name: b.name });
    this.notify(b, { kind: 'friend-req', uid: a.uid, name: a.name });
  }
  friendAccept(c, a, b) {
    if (!b) return;
    if (!a.inReq.includes(b.uid)) return this.err(c, 'nf', 'ไม่พบคำขอนี้แล้ว');
    without(a.inReq, b.uid); without(b.outReq, a.uid);
    if (!a.friends.includes(b.uid)) a.friends.push(b.uid);
    if (!b.friends.includes(a.uid)) b.friends.push(a.uid);
    this.saveUser(a); this.saveUser(b);
    this.touchSoc(a.uid, b.uid); this.touchPres();
    this.send(c, { t: 'ok', what: 'friend-ok', name: b.name });
    this.notify(b, { kind: 'friend-ok', uid: a.uid, name: a.name });
  }
  unlink(a, b) {
    without(a.friends, b.uid); without(b.friends, a.uid);
    without(a.inReq, b.uid); without(b.inReq, a.uid);
    without(a.outReq, b.uid); without(b.outReq, a.uid);
  }

  /* ---------- ข้อความหลัก ---------- */
  async onMessage(c, raw) {
    if (raw.length > LIMITS.msgBytes) return;
    let m;
    try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;

    if (m.t === 'hello') {
      if (c.ready) return;
      const cid = clean(m.cid, 64);
      if (cid.length < 12) return this.err(c, 'id', 'รหัสบัญชีไม่ถูกต้อง ลองรีเฟรชหน้านี้');
      let u = this.users.get(this.cidIdx.get(cid));
      let isNew = false;
      if (!u) {
        if (!this.allowNewUser(c)) return this.err(c, 'limit', 'สร้างบัญชีใหม่บ่อยเกินไป ลองใหม่ภายหลัง');
        let uid;
        do { uid = 'u' + rnd(10, ID_ALPHA); } while (this.users.has(uid));
        u = {
          uid, cid, code: this.newFriendCode(), name: 'ผู้มาใหม่', cfg: cleanCfg(), pv: '', status: 'online',
          created: Date.now(), seen: Date.now(), friends: [], inReq: [], outReq: [], blocked: [], dms: {}, servers: [], usedMs: 0, lastUse: 0
        };
        this.indexUser(u);
        isNew = true;
        const main = this.servers.get(MAIN);
        if (main) { this.addMember(main, u); this.saveServer(main).catch(() => {}); this.touchMem(MAIN); }
      }
      await this.loadPic(u);
      if (u.sub && (u.sub.demo || u.sub.until <= Date.now() + 60000)) await this.refreshSub(u, true); // ต่ออายุ/ตรวจสถานะก่อน เพื่อให้ของ Pro ในโปรไฟล์ผ่านการตรวจ
      if (m.prof || isNew) await this.setProfile(u, m.name, m.cfg);
      else if (!u.code) { u.code = this.newFriendCode(); this.codeIdx.set(u.code, u.uid); }
      if (STATUSES.includes(m.status)) u.status = m.status;
      if (isNew || m.prof) await this.saveUser(u);
      c.user = u; c.ready = true;
      this.proSeen.set(u.uid, this.isPro(u));
      let set = this.byUid.get(u.uid);
      if (!set) this.byUid.set(u.uid, (set = new Set()));
      set.add(c);
      this.send(c, {
        t: 'welcome', id: c.id,
        me: this.meFor(u), pay: this.payInfo(),
        servers: this.serversFor(u), presence: this.presenceFor(u), social: this.socialFor(u)
      });
      this.touchPres();
      if (isNew) this.touchSrv(MAIN);
      return;
    }
    if (!c.ready) return;
    const u = c.user;

    switch (m.t) {
      case 'ping': {
        const now = Date.now();
        if (m.a === 1 || m.a === true) this.use(u, now);
        this.send(c, { t: 'pong', used: u.usedMs || 0 });
        if (u.sub) { this.proTransition(u); this.refreshSub(u).catch(() => {}); }
        break;
      }

      /* ----- สมาชิก Pro ----- */
      case 'checkout': {
        if (!this.rate(c, 'co', 1500)) return;
        const plan = PRO.plans[m.plan] ? m.plan : '';
        if (!plan) return;
        if (this.pay.mode === 'off') return this.err(c, 'pay', 'ระบบสมัครสมาชิกยังไม่เปิดให้บริการ');
        if (this.isPro(u)) return this.err(c, 'pay', 'คุณเป็นสมาชิก Pro อยู่แล้ว');
        const disc = this.discOk(u);
        if (this.pay.mode === 'demo') {
          this.send(c, { t: 'checkout', demo: true, plan, base: PRO.plans[plan].thb, amount: priceSatang(plan, disc) / 100, disc });
          break;
        }
        try {
          const url = await this.pay.stripe.checkout({ uid: u.uid, plan, disc, origin: c.origin, customer: u.sub && u.sub.cus });
          this.send(c, { t: 'checkout', url, plan, disc });
        } catch (e) { this.err(c, 'pay', 'เชื่อมต่อระบบชำระเงินไม่ได้ในตอนนี้ ลองใหม่อีกครั้งภายหลัง'); }
        break;
      }

      // โหมดทดลอง: จำลองการจ่ายเงิน ไม่มีการตัดเงินจริง
      case 'demo-pay': {
        if (this.pay.mode !== 'demo' || !this.rate(c, 'dp', 1500)) return; // ใช้คีย์แยกจาก checkout เพราะผู้ใช้กดต่อกันเร็วได้
        const plan = PRO.plans[m.plan] ? m.plan : '';
        if (!plan || this.isPro(u)) return;
        const now = Date.now();
        u.sub = { plan, status: 'active', until: now + PRO.plans[plan].days * 86400000, cancel: false, demo: true, disc: this.discOk(u), since: now };
        await this.afterSubChange(u);
        this.send(c, { t: 'ok', what: 'sub-on', plan });
        break;
      }

      // โหมดทดลองเท่านั้น: ข้ามไปครบ 100 ชม. เพื่อสาธิตส่วนลดโดยไม่ต้องรอ (ใช้ไม่ได้เมื่อเปิด Stripe จริง)
      case 'demo-hours': {
        if (this.pay.mode !== 'demo' || !this.rate(c, 'dh', 1000)) return;
        if ((u.usedMs || 0) < PRO.discMs) {
          u.usedMs = PRO.discMs; u.usedSaved = u.usedMs; u.lastUse = Date.now();
          await this.saveUser(u);
          this.pushMe(u); this.maybeDiscount(u);
        }
        break;
      }

      // หลังกลับจากหน้าชำระเงินของ Stripe: ตรวจรายการแล้วเปิดสิทธิ์ทันที (ไม่ต้องรอ webhook)
      case 'sub-confirm': {
        if (this.pay.mode !== 'stripe' || !this.rate(c, 'sc', 1500)) return;
        const sid = clean(m.sid, 140);
        if (!/^cs_[A-Za-z0-9_]+$/.test(sid)) return;
        try {
          const ses = await this.pay.stripe.getSession(sid);
          if (!ses || ses.client_reference_id !== u.uid || ses.mode !== 'subscription' || ses.status !== 'complete' || !ses.subscription) return this.err(c, 'pay', 'ยังไม่พบการชำระเงินรายการนี้');
          const sub = await this.pay.stripe.getSub(typeof ses.subscription === 'object' ? ses.subscription.id : ses.subscription);
          if (!sub.metadata || sub.metadata.uid !== u.uid) return;
          { this.applySub(u, sub); await this.afterSubChange(u); }
          this.send(c, { t: 'ok', what: 'sub-on', plan: u.sub.plan });
        } catch (e) { this.err(c, 'pay', 'ตรวจสอบการชำระเงินไม่สำเร็จ ถ้าถูกตัดเงินแล้วสิทธิ์จะเปิดให้อัตโนมัติภายในไม่กี่นาที'); }
        break;
      }

      case 'sub-cancel': case 'sub-resume': {
        if (!this.rate(c, 'sx', 1500)) return;
        const s = u.sub;
        const stop = m.t === 'sub-cancel';
        if (!s || !this.isPro(u) || !!s.cancel === stop) return;
        try {
          if (!s.demo) await this.pay.stripe.setCancel(s.subId, stop);
          s.cancel = stop;
          await this.afterSubChange(u);
          this.send(c, { t: 'ok', what: stop ? 'sub-cancel' : 'sub-resume' });
        } catch (e) { this.err(c, 'pay', 'ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง'); }
        break;
      }

      case 'portal': {
        const s = u.sub;
        if (this.pay.mode !== 'stripe' || !s || !s.cus || !this.rate(c, 'sx', 1500)) return;
        try { this.send(c, { t: 'portal', url: await this.pay.stripe.portal(s.cus, c.origin) }); } catch (e) { this.err(c, 'pay', 'เปิดหน้าจัดการวิธีชำระเงินไม่ได้ (ผู้ดูแลต้องตั้งค่า Customer portal ใน Stripe ก่อน)'); }
        break;
      }

      case 'status': {
        if (!STATUSES.includes(m.s) || u.status === m.s) return;
        u.status = m.s;
        this.touchPres();
        break;
      }

      case 'profile': {
        await this.setProfile(u, m.name, m.cfg);
        c.user = u;
        const v = this.conns(u.uid).find((x) => x.room);
        if (v) this.members(v.room).forEach((x) => { if (x.user !== u) this.send(x, { t: 'peer-update', peer: this.pub(v) }); });
        this.touchProfile(u);
        break;
      }

      // ขอรูปโปรไฟล์ที่อัปโหลด (ส่งแยกเพื่อไม่ให้รายชื่อหนักเกินไป)
      case 'pics': {
        const want = Array.isArray(m.uids) ? m.uids.slice(0, LIMITS.picsPerReq).map((v) => clean(v, 40)) : [];
        const pics = {};
        for (const id of want) {
          const p = this.users.get(id);
          if (!p || !p.pv) continue;
          let pic = isData(p.cfg.pic) ? p.cfg.pic : await this.st.get('pic:' + id);
          if (isData(pic)) pics[id] = { pv: p.pv, pic };
        }
        this.send(c, { t: 'pics', pics });
        break;
      }

      case 'members': {
        const s = this.servers.get(m.sid);
        if (!s || !s.mset.has(u.uid)) return;
        this.send(c, { t: 'members', sid: s.id, list: this.roster(s) });
        break;
      }

      /* ----- เซิร์ฟเวอร์ ----- */
      case 'mk-server': {
        if (!this.rate(c, 'mk', 3000)) return;
        const name = clean(m.name, 30);
        if (!name) return;
        const owned = [...this.servers.values()].filter((s) => s.owner === u.uid).length;
        if (owned >= LIMITS.srvOwn) return this.err(c, 'many', 'สร้างเซิร์ฟเวอร์ได้สูงสุด ' + LIMITS.srvOwn + ' อัน');
        if (u.servers.length >= LIMITS.srvJoin) return this.err(c, 'many', 'อยู่ในเซิร์ฟเวอร์ครบ ' + LIMITS.srvJoin + ' อันแล้ว ออกจากบางอันก่อน');
        const s = this.makeServer({
          name, icon: m.icon, owner: u.uid,
          channels: [
            { id: this.newChannelId(), type: 'text', name: 'ทั่วไป', desc: 'คุยกันได้ทุกเรื่องที่นี่', owner: null },
            { id: this.newChannelId(), type: 'voice', name: 'ห้องเสียงทั่วไป', desc: '', mood: 'คุยเบาๆ ได้', cap: 8, owner: null }
          ]
        });
        this.addMember(s, u);
        await this.saveServer(s); await this.saveUser(u);
        this.send(c, { t: 'server-joined', sid: s.id, created: true });
        this.pushServersTo(u);
        break;
      }

      case 'invite-info': {
        if (!this.rate(c, 'inv', 600)) return;
        const s = this.servers.get(this.invIdx.get(cleanCode(m.code)));
        if (!s) return this.send(c, { t: 'invite', code: cleanCode(m.code), bad: true });
        this.send(c, { t: 'invite', code: s.code, id: s.id, name: s.name, icon: s.icon, n: s.members.length, member: s.mset.has(u.uid) });
        break;
      }

      case 'join-server': {
        if (!this.rate(c, 'jn', 600)) return;
        const s = this.servers.get(this.invIdx.get(cleanCode(m.code)));
        if (!s) return this.err(c, 'nf', 'ไม่พบเซิร์ฟเวอร์จากรหัสเชิญนี้ รหัสอาจหมดอายุหรือถูกเปลี่ยนแล้ว');
        if (s.mset.has(u.uid)) return this.send(c, { t: 'server-joined', sid: s.id });
        if (s.members.length >= LIMITS.srvMembers) return this.err(c, 'full', 'เซิร์ฟเวอร์นี้เต็มแล้ว');
        if (u.servers.length >= LIMITS.srvJoin) return this.err(c, 'many', 'อยู่ในเซิร์ฟเวอร์ครบ ' + LIMITS.srvJoin + ' อันแล้ว ออกจากบางอันก่อน');
        this.addMember(s, u);
        await this.saveServer(s); await this.saveUser(u);
        this.send(c, { t: 'server-joined', sid: s.id });
        this.pushServersTo(u);
        this.touchSrv(s.id); this.touchMem(s.id); this.touchPres();
        break;
      }

      case 'leave-server': {
        const s = this.servers.get(m.sid);
        if (!s || !s.mset.has(u.uid)) return;
        if (s.owner === u.uid) return this.err(c, 'perm', 'เจ้าของออกจากเซิร์ฟเวอร์ไม่ได้ ลบเซิร์ฟเวอร์แทน');
        this.removeMember(s, u);
        await this.saveServer(s); await this.saveUser(u);
        this.conns(u.uid).forEach((x) => this.send(x, { t: 'server-gone', sid: s.id }));
        this.pushServersTo(u);
        this.touchMem(s.id); this.touchSrv(s.id); this.touchPres();
        break;
      }

      case 'edit-server': {
        const s = this.servers.get(m.sid);
        if (!s || s.main || s.owner !== u.uid) return;
        const name = clean(m.name, 30);
        if (name) s.name = name;
        if (m.icon) s.icon = cleanIcon(m.icon);
        await this.saveServer(s);
        this.touchSrv(s.id);
        break;
      }

      case 'regen-invite': {
        const s = this.servers.get(m.sid);
        if (!s || s.main || s.owner !== u.uid) return;
        this.invIdx.delete(s.code);
        s.code = this.newInvite();
        this.invIdx.set(s.code, s.id);
        await this.saveServer(s);
        this.touchSrv(s.id);
        break;
      }

      case 'kick': {
        const s = this.servers.get(m.sid);
        const t = this.users.get(m.uid);
        if (!s || !t || s.main || s.owner !== u.uid || t === u || !s.mset.has(t.uid)) return;
        this.removeMember(s, t);
        await this.saveServer(s); await this.saveUser(t);
        this.conns(t.uid).forEach((x) => this.send(x, { t: 'server-gone', sid: s.id, kicked: true, name: s.name }));
        this.pushServersTo(t);
        this.touchMem(s.id); this.touchSrv(s.id); this.touchPres();
        break;
      }

      case 'del-server': {
        const s = this.servers.get(m.sid);
        if (!s || s.main || s.owner !== u.uid) return;
        const uids = [...s.members];
        const chs = s.channels.slice();
        chs.forEach((ch) => this.members(ch.id).forEach((x) => this.leaveVoice(x)));
        for (const ch of chs) await this.purgeLog('chat:' + ch.id);
        this.servers.delete(s.id); this.invIdx.delete(s.code);
        chs.forEach((ch) => { this.chIdx.delete(ch.id); this.logs.delete('chat:' + ch.id); });
        for (const uid of uids) {
          const v = this.users.get(uid);
          if (!v) continue;
          without(v.servers, s.id);
          await this.saveUser(v);
          this.conns(uid).forEach((x) => { this.send(x, { t: 'server-gone', sid: s.id, deleted: true, name: s.name }); });
        }
        await this.st.delete('srv:' + s.id);
        for (const ch of chs) await this.st.delete('chat:' + ch.id);
        uids.forEach((uid) => { const v = this.users.get(uid); if (v) this.pushServersTo(v); });
        this.touchPres();
        break;
      }

      /* ----- ช่อง ----- */
      case 'create': {
        const s = this.servers.get(m.sid);
        if (!s || !s.mset.has(u.uid)) return;
        if (!this.canMake(s, u)) return this.err(c, 'perm', 'เฉพาะเจ้าของเซิร์ฟเวอร์ที่สร้างช่องได้');
        if (s.channels.length >= (s.main ? LIMITS.chMain : LIMITS.chOther)) return this.err(c, 'many', 'มีช่องเยอะเกินไปแล้ว ลองลบช่องที่ไม่ใช้ก่อน');
        const name = clean(m.name, 40);
        if (!name) return;
        const type = m.type === 'text' ? 'text' : 'voice';
        const r = { id: this.newChannelId(), type, name, desc: clean(m.desc, 100), owner: u.uid };
        if (type === 'voice') {
          r.mood = MOODS.includes(m.mood) ? m.mood : MOODS[1];
          r.cap = [4, 6, 8].includes(+m.cap) ? +m.cap : 8;
        }
        s.channels.push(r); this.chIdx.set(r.id, s.id);
        await this.saveServer(s);
        this.send(c, { t: 'created', sid: s.id, room: r.id, type });
        this.touchSrv(s.id);
        break;
      }

      case 'delete': {
        const sid = this.chIdx.get(m.room);
        const s = sid && this.servers.get(sid);
        if (!s || !s.mset.has(u.uid)) return;
        const ch = s.channels.find((x) => x.id === m.room);
        if (!ch || !this.canDelCh(s, ch, u)) return this.err(c, 'perm', 'ลบได้เฉพาะคนสร้างห้อง เจ้าของเซิร์ฟเวอร์ หรือผู้ดูแลเว็บ (สำหรับห้องของเซิร์ฟเวอร์กลาง)');
        if (s.channels.length <= 1) return this.err(c, 'perm', 'เซิร์ฟเวอร์ต้องมีอย่างน้อยหนึ่งช่อง');
        this.members(ch.id).forEach((x) => this.leaveVoice(x));
        await this.purgeLog('chat:' + ch.id);
        s.channels = s.channels.filter((x) => x !== ch);
        this.chIdx.delete(ch.id); this.logs.delete('chat:' + ch.id);
        s.mset.forEach((uid) => this.conns(uid).forEach((x) => this.send(x, { t: 'room-deleted', room: ch.id, sid: s.id })));
        await this.saveServer(s);
        await this.st.delete('chat:' + ch.id);
        this.touchSrv(s.id);
        break;
      }

      /* ----- ห้องเสียง ----- */
      case 'join': {
        const sid = this.chIdx.get(m.room);
        const s = sid && this.servers.get(sid);
        if (!s || !s.mset.has(u.uid)) return this.err(c, 'nf', 'ไม่พบช่องนี้ อาจถูกลบไปแล้ว');
        const ch = s.channels.find((x) => x.id === m.room);
        if (!ch || ch.type !== 'voice' || c.room === ch.id) return;
        const ms = this.members(ch.id);
        if (ms.length >= (ch.cap || 8)) return this.err(c, 'full', 'ห้องนี้เต็มแล้ว');
        this.leaveVoice(c);
        c.room = ch.id; c.vs = sid;
        this.send(c, { t: 'joined', room: ch.id, sid, members: ms.map((x) => this.pub(x)) });
        ms.forEach((x) => this.send(x, { t: 'peer-joined', peer: this.pub(c) }));
        this.touchSrv(sid); this.touchPres();
        break;
      }

      case 'leave':
        this.leaveVoice(c);
        break;

      case 'state': {
        if (!c.room) return;
        c.cam = !!m.cam; c.mic = !!m.mic; c.scr = !!m.scr;
        c.rd = [1, 2, 3].includes(m.rd) ? m.rd : 0; // ป้ายตัวช่วยอ่าน: 1 กำลังอ่าน 2 อ่านครบ 3 พัก
        this.members(c.room).forEach((x) => { if (x !== c) this.send(x, { t: 'peer-state', id: c.id, cam: c.cam, mic: c.mic, scr: c.scr, rd: c.rd }); });
        this.touchSrv(c.vs);
        break;
      }

      case 'signal': {
        const to = this.clients.get(m.to);
        if (!c.room || !to || to.room !== c.room) return;
        this.send(to, { t: 'signal', from: c.id, data: m.data });
        break;
      }

      /* ----- แชต (ช่องและแชตส่วนตัว) ----- */
      case 'view': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx) return;
        this.send(c, { t: 'history', room: m.room, msgs: await this.getLog(ctx.key) });
        break;
      }

      case 'msg': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx) return;
        if (!ctx.ok) return this.err(c, 'dm', 'ส่งข้อความหาคนนี้ไม่ได้');
        const now = Date.now();
        if (now - c.lastChat < LIMITS.chatGapMs) return;
        const text = cleanMsg(m.text);
        let att = null;
        if (typeof m.file === 'string' && m.file) {
          const up = await this.upRec(m.file);
          if (!up || up.kind !== 'file' || up.state !== 'done' || up.uid !== u.uid || up.room !== m.room) return this.err(c, 'file', 'ไม่พบไฟล์ที่อัปโหลด ลองแนบใหม่อีกครั้ง');
          att = { id: up.fid, name: up.name, size: up.size };
        }
        if (!text && !att) return;
        c.lastChat = now;
        const log = await this.getLog(ctx.key);
        const msg = {
          id: now.toString(36) + Math.random().toString(36).slice(2, 6),
          uid: u.uid, name: u.name, text, ts: now, s: u.cfg.shirt, p: presetOf(u), f: this.eff(u).frame
        };
        if (att) { msg.file = att; await this.upDone(att.id); }
        if (this.isPro(u)) msg.pro = 1;
        const ref = typeof m.reply === 'string' ? log.find((x) => x.id === m.reply) : null;
        if (ref) msg.reply = { id: ref.id, uid: ref.uid || '', name: ref.name, snip: (String(ref.text).replace(/\s+/g, ' ').slice(0, 80)) || (ref.file ? '📎 ' + ref.file.name : '') };
        log.push(msg);
        this.trim(log);
        this.persist(ctx.key, log);
        if (ctx.kind === 'ch') { ctx.ch.last = now; this.saveServersLater(); } else this.touchDm(u, ctx.peer, now);
        ctx.targets((x, room) => this.send(x, { t: 'msg', room, msg }));
        break;
      }

      case 'edit': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx) return;
        const log = await this.getLog(ctx.key);
        const msg = log.find((x) => x.id === m.id);
        if (!msg || !msg.uid || msg.uid !== u.uid) return;
        const text = cleanMsg(m.text);
        if (!text) return;
        msg.text = text; msg.edited = true;
        this.persist(ctx.key, log);
        ctx.targets((x, room) => this.send(x, { t: 'msg-edit', room, id: msg.id, text }));
        break;
      }

      case 'del': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx) return;
        const log = await this.getLog(ctx.key);
        const i = log.findIndex((x) => x.id === m.id);
        if (i < 0) return;
        const own = log[i].uid && log[i].uid === u.uid;
        if (!own && !ctx.mod) return this.err(c, 'perm', 'ลบได้เฉพาะข้อความของตัวเอง หรือเจ้าของเซิร์ฟเวอร์');
        this.dropFiles(log.splice(i, 1));
        this.persist(ctx.key, log);
        ctx.targets((x, room) => this.send(x, { t: 'msg-del', room, id: m.id }));
        break;
      }

      case 'react': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx || !REACTS.includes(m.emoji)) return;
        const log = await this.getLog(ctx.key);
        const msg = log.find((x) => x.id === m.id);
        if (!msg) return;
        const rx = msg.react || (msg.react = {});
        const arr = rx[m.emoji] || [];
        const at = arr.indexOf(u.uid);
        if (at >= 0) arr.splice(at, 1);
        else {
          if (!rx[m.emoji] && Object.keys(rx).length >= LIMITS.reactKinds) return;
          arr.push(u.uid);
        }
        if (arr.length) rx[m.emoji] = arr; else delete rx[m.emoji];
        if (!Object.keys(rx).length) delete msg.react;
        this.persist(ctx.key, log);
        ctx.targets((x, room) => this.send(x, { t: 'msg-react', room, id: msg.id, react: msg.react || {} }));
        break;
      }

      case 'typing': {
        const ctx = this.ctxOf(c, m.room);
        if (!ctx || !ctx.ok) return;
        const now = Date.now();
        if (now - c.lastTyping < LIMITS.typingGapMs) return;
        c.lastTyping = now;
        ctx.targets((x, room) => { if (x !== c) this.send(x, { t: 'typing', room, uid: u.uid, name: u.name }); });
        break;
      }

      /* ----- อัปโหลดไฟล์ (ตัวไฟล์ส่งผ่าน HTTP ที่ /api/up/... ข้อความนี้แค่ขอสิทธิ์และรับโค้ดอัปโหลด) ----- */
      case 'up-init': {
        const rid = clean(m.rid, 20);
        const bad = (code, msg, extra) => this.err(c, code, msg, { rid, ...(extra || {}) });
        if (!this.files) return bad('nofiles', 'ระบบเก็บไฟล์ยังไม่ได้เปิดใช้งานบนเซิร์ฟเวอร์นี้ (ผู้ดูแลต้องผูก R2 ตามคู่มือ)');
        if (!this.rate(c, 'up', LIMITS.upGapMs)) return bad('rate', 'ช้าลงนิดนึง รอสักครู่แล้วลองใหม่');
        const kind = m.kind === 'glb' ? 'glb' : 'file';
        const size = Math.floor(+m.size);
        if (!(size > 0)) return bad('file', 'ไฟล์นี้ว่างเปล่า');
        const pro = this.isPro(u);
        let name = clean(m.name, LIMITS.fileName).replace(/[\\/:*?"<>|]/g, '_') || 'file';
        if (kind === 'file') {
          const ctx = this.ctxOf(c, m.room);
          if (!ctx || !ctx.ok) return bad('dm', 'อัปโหลดไปที่นี่ไม่ได้');
          if (!pro && size > LIMITS.freeFile) return bad('big', 'ไฟล์ใหญ่เกิน ' + (LIMITS.freeFile / 1048576) + ' MB สมาชิก Pro อัปโหลดไฟล์ได้ไม่จำกัดขนาด', { upsell: true });
          if (size > UP_PART * LIMITS.maxParts) return bad('big', 'ไฟล์ใหญ่เกินกว่าที่ระบบรองรับ');
        } else {
          if (!pro) return bad('pro', 'อัปโหลดโมเดล 3D ได้เฉพาะสมาชิก Pro', { upsell: true });
          if (!/\.glb$/i.test(name)) return bad('file', 'รองรับเฉพาะไฟล์โมเดล .glb');
          if (size > LIMITS.glbMax) return bad('big', 'โมเดลใหญ่เกิน ' + (LIMITS.glbMax / 1048576) + ' MB ลองลดขนาดหรือจำนวนพื้นผิวก่อน');
        }
        const mine = [...this.ups.values()].filter((x) => x.uid === u.uid && x.state === 'init').length;
        if (mine >= LIMITS.upPending) return bad('rate', 'กำลังอัปโหลดหลายไฟล์อยู่ รอให้เสร็จก่อน');
        const parts = Math.ceil(size / UP_PART);
        const rec = { fid: rnd(16, ID_ALPHA), tok: rnd(24, ID_ALPHA), uid: u.uid, kind, room: kind === 'file' ? m.room : '', name, size, parts, ts: Date.now(), state: 'init', done: {}, mp: '' };
        try {
          if (parts > 1) rec.mp = (await this.files.begin('f/' + rec.fid, this.fileMeta(rec))).uploadId;
          await this.upSave(rec);
        } catch (e) { return bad('file', 'เริ่มอัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง'); }
        this.send(c, { t: 'up-ready', rid, fid: rec.fid, tok: rec.tok, parts, part: UP_PART, kind });
        break;
      }

      case 'glb-del': {
        if (!u.glb) return;
        const old = u.glb;
        u.glb = null; u.cfg.useGlb = false;
        if (this.files) Promise.resolve(this.files.delete('f/' + old.id)).catch(() => {});
        await this.saveUser(u);
        this.pushMe(u); this.touchProfile(u); this.refreshLooks(u);
        break;
      }

      case 'glb-use': {
        if (!u.glb || !this.isPro(u)) return;
        u.cfg.useGlb = !!m.on;
        await this.saveUser(u);
        this.pushMe(u); this.touchProfile(u); this.refreshLooks(u);
        break;
      }

      /* ----- เพื่อนและแชตส่วนตัว ----- */
      case 'friend-add': {
        if (!this.rate(c, 'fa', 1200)) return this.err(c, 'rate', 'ช้าลงนิดนึง ลองใหม่อีกครั้ง');
        const b = m.uid ? this.users.get(clean(m.uid, 40)) : this.users.get(this.codeIdx.get(cleanCode(m.code)));
        this.friendReq(c, u, b);
        break;
      }
      case 'friend-accept': this.friendAccept(c, u, this.users.get(clean(m.uid, 40))); break;
      case 'friend-decline': {
        const b = this.users.get(clean(m.uid, 40));
        if (!b) return;
        without(u.inReq, b.uid); without(b.outReq, u.uid); without(u.outReq, b.uid); without(b.inReq, u.uid);
        this.saveUser(u); this.saveUser(b); this.touchSoc(u.uid, b.uid);
        break;
      }
      case 'friend-remove': {
        const b = this.users.get(clean(m.uid, 40));
        if (!b) return;
        this.unlink(u, b);
        this.saveUser(u); this.saveUser(b); this.touchSoc(u.uid, b.uid); this.touchPres();
        break;
      }
      case 'block': {
        const b = this.users.get(clean(m.uid, 40));
        if (!b || b === u) return;
        if (u.blocked.length >= LIMITS.blocked) return this.err(c, 'many', 'บล็อกได้สูงสุด ' + LIMITS.blocked + ' คน');
        this.unlink(u, b);
        if (!u.blocked.includes(b.uid)) u.blocked.push(b.uid);
        delete u.dms[b.uid];
        this.saveUser(u); this.saveUser(b); this.touchSoc(u.uid, b.uid); this.touchPres();
        break;
      }
      case 'unblock': {
        const b = this.users.get(clean(m.uid, 40));
        if (!b) return;
        without(u.blocked, b.uid);
        this.saveUser(u); this.touchSoc(u.uid);
        break;
      }
      case 'dm-open': {
        const b = this.users.get(clean(m.uid, 40));
        if (!b || b === u) return;
        if (!this.canDM(u, b)) return this.err(c, 'dm', 'ส่งข้อความหาคนนี้ไม่ได้ ต้องเป็นเพื่อนหรืออยู่เซิร์ฟเวอร์เดียวกัน');
        if (!(b.uid in u.dms)) { u.dms[b.uid] = 0; this.trimDms(u); this.saveUser(u); this.touchSoc(u.uid); }
        this.send(c, { t: 'dm-opened', uid: b.uid });
        break;
      }
      case 'dm-close': {
        if (!(m.uid in u.dms)) return;
        delete u.dms[m.uid];
        this.saveUser(u); this.touchSoc(u.uid);
        break;
      }
    }
  }

  /* ---------- ไฟล์ที่อัปโหลด ---------- */
  fileMeta(rec) { return { name: rec.name }; }
  async upRec(fid) {
    if (typeof fid !== 'string' || !/^[a-z0-9]{16}$/.test(fid)) return null;
    let r = this.ups.get(fid);
    if (!r) { r = await this.st.get('up:' + fid); if (r) this.ups.set(fid, r); }
    return r || null;
  }
  upSave(rec) { this.ups.set(rec.fid, rec); return this.st.put('up:' + rec.fid, rec); }
  // ไฟล์ถูกแนบกับข้อความแล้ว: ลบบันทึกชั่วคราวทิ้ง (ไฟล์เป็นของข้อความนั้นต่อไป)
  async upDone(fid) { this.ups.delete(fid); await this.st.delete('up:' + fid); }
  // ล้างการอัปโหลดที่ค้าง (เริ่มแล้วไม่เสร็จ หรือเสร็จแล้วไม่ได้แนบกับข้อความ) เก่ากว่า 2 ชั่วโมง
  async sweepUploads() {
    this.lastSweep = Date.now();
    if (!this.files) return;
    try {
      for (const [, r] of await this.st.list('up:')) {
        if (Date.now() - r.ts < LIMITS.upTtlMs) continue;
        try {
          if (r.state === 'init' && r.mp) await this.files.abort('f/' + r.fid, r.mp);
          else await this.files.delete('f/' + r.fid);
        } catch (e) { /* ข้าม */ }
        this.ups.delete(r.fid);
        await this.st.delete('up:' + r.fid);
      }
    } catch (e) { /* ข้าม */ }
  }

  /* ---------- HTTP: ส่วนอัปโหลดไฟล์และ webhook ของ Stripe (Worker ส่งต่อมาที่นี่) ---------- */
  async http(request) {
    const url = new URL(request.url);
    const J = (o, status) => new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    if (url.pathname === '/api/stripe-webhook') {
      if (request.method !== 'POST') return J({ error: 'method' }, 405);
      if (this.pay.mode !== 'stripe' || !this.pay.verify) return J({ error: 'webhook ยังไม่ได้ตั้งค่า' }, 400);
      const raw = await request.text();
      let evt;
      try { evt = await this.pay.verify(raw, request.headers.get('stripe-signature') || ''); } catch (e) { return J({ error: 'ลายเซ็นไม่ถูกต้อง' }, 400); }
      try { await this.stripeEvent(evt); } catch (e) { return J({ error: 'ประมวลผลไม่สำเร็จ' }, 500); } // ตอบ 5xx เพื่อให้ Stripe ส่งซ้ำ
      return J({ ok: true });
    }
    const mm = url.pathname.match(/^\/api\/up\/([a-z0-9]{16})(?:\/(\d{1,5}|done))?$/);
    if (!mm || !this.files) return J({ error: 'ไม่พบ' }, 404);
    const rec = await this.upRec(mm[1]);
    if (!rec || rec.tok !== url.searchParams.get('tok')) return J({ error: 'ไม่ได้รับอนุญาต' }, 403);

    if (request.method === 'DELETE' && !mm[2]) {
      this.ups.delete(rec.fid); await this.st.delete('up:' + rec.fid);
      try { if (rec.state === 'init' && rec.mp) await this.files.abort('f/' + rec.fid, rec.mp); else await this.files.delete('f/' + rec.fid); } catch (e) { /* ข้าม */ }
      return J({ ok: true });
    }
    if (request.method === 'PUT' && mm[2] && mm[2] !== 'done') {
      if (rec.state !== 'init') return J({ error: 'อัปโหลดเสร็จไปแล้ว' }, 409);
      const n = +mm[2];
      if (n < 1 || n > rec.parts) return J({ error: 'ลำดับส่วนไม่ถูกต้อง' }, 400);
      const want = n < rec.parts ? UP_PART : rec.size - UP_PART * (rec.parts - 1);
      const len = +request.headers.get('content-length');
      if (!request.body || len !== want) return J({ error: 'ขนาดไม่ตรงกับที่แจ้งไว้' }, 400);
      try {
        if (rec.parts === 1) { await this.files.put('f/' + rec.fid, request.body, this.fileMeta(rec), want); rec.done[1] = '1'; }
        else rec.done[n] = (await this.files.part('f/' + rec.fid, rec.mp, n, request.body, want)).etag;
        await this.upSave(rec);
      } catch (e) { return J({ error: 'บันทึกไฟล์ไม่สำเร็จ' }, 500); }
      return J({ ok: true, n });
    }
    if (request.method === 'POST' && mm[2] === 'done') {
      if (rec.state === 'done') return J({ ok: true, fid: rec.fid, name: rec.name, size: rec.size });
      for (let i = 1; i <= rec.parts; i++) if (!rec.done[i]) return J({ error: 'ส่งไฟล์ยังไม่ครบ' }, 409);
      const u = this.users.get(rec.uid);
      try {
        if (rec.parts > 1) await this.files.complete('f/' + rec.fid, rec.mp, Object.keys(rec.done).map(Number).sort((a, b) => a - b).map((n) => ({ partNumber: n, etag: rec.done[n] })));
        if (rec.kind === 'glb') {
          const head = await this.files.read('f/' + rec.fid, 0, 12); // GLB ต้องขึ้นต้นด้วย "glTF" เวอร์ชัน 2
          const ok = head && head.length >= 12 && String.fromCharCode(head[0], head[1], head[2], head[3]) === 'glTF' && (head[4] | head[5] << 8 | head[6] << 16 | head[7] << 24) === 2;
          if (!ok || !u || !this.isPro(u)) {
            await this.files.delete('f/' + rec.fid); this.ups.delete(rec.fid); await this.st.delete('up:' + rec.fid);
            return J({ error: ok ? 'ต้องเป็นสมาชิก Pro' : 'ไฟล์นี้ไม่ใช่โมเดล GLB ที่ถูกต้อง' }, 415);
          }
          const old = u.glb;
          u.glb = { id: rec.fid, name: rec.name, size: rec.size }; u.cfg.useGlb = true;
          if (old && this.files) Promise.resolve(this.files.delete('f/' + old.id)).catch(() => {});
          this.ups.delete(rec.fid); await this.st.delete('up:' + rec.fid);
          await this.saveUser(u);
          this.pushMe(u); this.touchProfile(u); this.refreshLooks(u);
          return J({ ok: true, fid: rec.fid, name: rec.name, size: rec.size });
        }
        rec.state = 'done'; rec.ts = Date.now();
        await this.upSave(rec);
      } catch (e) { return J({ error: 'ปิดการอัปโหลดไม่สำเร็จ' }, 500); }
      return J({ ok: true, fid: rec.fid, name: rec.name, size: rec.size });
    }
    return J({ error: 'ไม่รองรับ' }, 405);
  }

  trimDms(u) {
    const ids = Object.keys(u.dms);
    if (ids.length <= LIMITS.dms) return;
    ids.sort((a, b) => u.dms[a] - u.dms[b]).slice(0, ids.length - LIMITS.dms).forEach((id) => delete u.dms[id]);
  }
  touchDm(a, b, ts) {
    a.dms[b.uid] = ts; b.dms[a.uid] = ts;
    this.trimDms(a); this.trimDms(b);
    this.saveUser(a); this.saveUser(b);
    this.touchSoc(a.uid, b.uid);
  }
}
