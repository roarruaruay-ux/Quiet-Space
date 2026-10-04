// ตัวเชื่อม Stripe แบบเรียก REST ตรงๆ (ไม่ต้องติดตั้งไลบรารี) ใช้ได้ทั้งบน Workers และ Node
// ราคา/คูปองจะถูกสร้างให้อัตโนมัติครั้งแรกที่มีคนกดสมัคร ไม่ต้องไปตั้งใน Stripe เอง

const VERSION = '2024-06-20'; // ล็อกเวอร์ชัน API ไว้ให้โครงสร้างข้อมูลคงที่

const enc = encodeURIComponent;
function flat(v, key, out) {
  if (v == null) return out;
  if (Array.isArray(v)) v.forEach((x, i) => flat(x, key + '[' + i + ']', out));
  else if (typeof v === 'object') Object.keys(v).forEach((k) => flat(v[k], key ? key + '[' + k + ']' : k, out));
  else out.push(enc(key) + '=' + enc(String(v)));
  return out;
}
export const formEncode = (o) => flat(o, '', []).join('&');

export class Stripe {
  // opts: { plans: {month:{thb,interval,key,label}, ...}, coupon, pct, base, fetch }
  constructor(secret, opts) {
    opts = opts || {};
    this.secret = secret;
    this.plans = opts.plans || {};
    this.coupon = opts.coupon || 'qs_loyal10';
    this.pct = opts.pct || 10;
    this.base = (opts.base || 'https://api.stripe.com').replace(/\/$/, '');
    this.f = opts.fetch || ((...a) => fetch(...a));
    this.priceIds = null;
    this.couponOk = false;
  }

  async call(method, path, params) {
    const init = { method, headers: { Authorization: 'Bearer ' + this.secret, 'Stripe-Version': VERSION } };
    let url = this.base + path;
    const body = params ? formEncode(params) : '';
    if (body) {
      if (method === 'GET') url += '?' + body;
      else { init.body = body; init.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    }
    const r = await this.f(url, init);
    let j = {};
    try { j = await r.json(); } catch (e) { /* ว่าง */ }
    if (!r.ok) {
      const e = new Error((j.error && j.error.message) || 'Stripe ' + r.status);
      e.status = r.status; e.code = j.error && j.error.code;
      throw e;
    }
    return j;
  }

  async prices() {
    if (this.priceIds) return this.priceIds;
    const names = Object.keys(this.plans);
    const list = await this.call('GET', '/v1/prices', { lookup_keys: names.map((n) => this.plans[n].key), active: 'true', limit: 20 });
    const byKey = {};
    let product = '';
    for (const p of list.data || []) { byKey[p.lookup_key] = p.id; product = product || (typeof p.product === 'string' ? p.product : p.product && p.product.id); }
    for (const n of names) {
      const pl = this.plans[n];
      if (byKey[pl.key]) continue;
      if (!product) product = (await this.call('POST', '/v1/products', { name: 'QuietSpace Pro' })).id;
      try {
        byKey[pl.key] = (await this.call('POST', '/v1/prices', {
          product, currency: 'thb', unit_amount: pl.thb * 100, recurring: { interval: pl.interval }, lookup_key: pl.key, nickname: 'QuietSpace Pro ' + pl.label
        })).id;
      } catch (e) { // อาจมีคนสร้างพร้อมกัน ลองถามหาอีกครั้ง
        const again = await this.call('GET', '/v1/prices', { lookup_keys: [pl.key] });
        if (!again.data || !again.data[0]) throw e;
        byKey[pl.key] = again.data[0].id;
      }
    }
    const out = {};
    names.forEach((n) => { out[n] = byKey[this.plans[n].key]; });
    return (this.priceIds = out);
  }

  async ensureCoupon() {
    if (this.couponOk) return;
    try { await this.call('GET', '/v1/coupons/' + enc(this.coupon)); } catch (e) {
      if (e.status !== 404) throw e;
      try { await this.call('POST', '/v1/coupons', { id: this.coupon, percent_off: this.pct, duration: 'forever', name: 'ใช้งานครบ 100 ชั่วโมง ลด ' + this.pct + '%' }); } catch (e2) { if (e2.code !== 'resource_already_exists') throw e2; }
    }
    this.couponOk = true;
  }

  // สร้างหน้าชำระเงินของ Stripe คืนค่าเป็น URL
  async checkout(o) {
    if (!o.origin) throw new Error('ไม่ทราบที่อยู่เว็บสำหรับกลับมาหลังชำระเงิน');
    const ids = await this.prices();
    const p = {
      mode: 'subscription',
      line_items: [{ price: ids[o.plan], quantity: 1 }],
      success_url: o.origin + '/?paid=1&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: o.origin + '/?paid=0',
      client_reference_id: o.uid, locale: 'th',
      metadata: { uid: o.uid, plan: o.plan },
      subscription_data: { metadata: { uid: o.uid, plan: o.plan, disc: o.disc ? '1' : '0' } }
    };
    if (o.customer) p.customer = o.customer;
    if (o.disc) { await this.ensureCoupon(); p.discounts = [{ coupon: this.coupon }]; }
    const s = await this.call('POST', '/v1/checkout/sessions', p);
    if (!s.url) throw new Error('Stripe ไม่ส่งลิงก์ชำระเงินกลับมา');
    return s.url;
  }

  getSession(id) { return this.call('GET', '/v1/checkout/sessions/' + enc(id)); }
  getSub(id) { return this.call('GET', '/v1/subscriptions/' + enc(id)); }
  setCancel(id, atEnd) { return this.call('POST', '/v1/subscriptions/' + enc(id), { cancel_at_period_end: atEnd ? 'true' : 'false' }); }
  async discount(id) { await this.ensureCoupon(); return this.call('POST', '/v1/subscriptions/' + enc(id), { discounts: [{ coupon: this.coupon }] }); }
  async portal(customer, origin) { return (await this.call('POST', '/v1/billing_portal/sessions', { customer, return_url: origin + '/' })).url; }
}

// ตรวจลายเซ็นของ webhook (Stripe-Signature: t=...,v1=...) ด้วย HMAC-SHA256  คืนค่าเป็นอีเวนต์ หรือโยน error ถ้าไม่ผ่าน
export async function verifyWebhook(raw, header, secret, tolerance) {
  const parts = String(header || '').split(',').map((x) => x.trim().split('='));
  const t = (parts.find((p) => p[0] === 't') || [])[1];
  const sigs = parts.filter((p) => p[0] === 'v1').map((p) => p[1]);
  if (!t || !sigs.length || !secret) throw new Error('no signature');
  if (Math.abs(Date.now() / 1000 - +t) > (tolerance || 300)) throw new Error('stale');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(t + '.' + raw)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
  const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
  if (!sigs.some((s) => same(s, hex))) throw new Error('bad signature');
  return JSON.parse(raw);
}
