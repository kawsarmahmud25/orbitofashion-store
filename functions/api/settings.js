import { json, requireAdmin, cleanStr, clampInt } from './_lib.js';

const ALLOWED_KEYS = ['brand_name', 'whatsapp_number', 'helpline', 'address', 'delivery_inside', 'delivery_outside'];

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
    const out = {};
    (results || []).forEach((r) => (out[r.key] = r.value));
    return json({ settings: out });
  } catch {
    return json({ error: 'সেটিংস লোড করা যায়নি' }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ ডেটা' }, 400);
  }
  try {
    for (const key of ALLOWED_KEYS) {
      if (!(key in body)) continue;
      let value = cleanStr(body[key], key === 'address' ? 300 : 60);
      if (key === 'delivery_inside' || key === 'delivery_outside') {
        value = String(clampInt(value, 0, 10000, key === 'delivery_inside' ? 60 : 120));
      }
      if (key === 'whatsapp_number') {
        value = value.replace(/\D/g, '').slice(0, 15);
        if (value && !/^8801\d{9}$/.test(value)) return json({ error: 'হোয়াটসঅ্যাপ নম্বর সঠিক নয় (8801XXXXXXXXX)' }, 400);
      }
      await env.DB.prepare(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
      ).bind(key, value).run();
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'সংরক্ষণ করা যায়নি' }, 500);
  }
}
