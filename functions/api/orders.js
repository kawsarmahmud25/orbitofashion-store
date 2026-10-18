import { json, requireAdmin, cleanStr, clampInt, DISTRICTS, PAYMENTS, ORDER_STATUSES } from './_lib.js';

const ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makeOrderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = 'OF-';
  for (const b of bytes) s += ID_CHARS[b % ID_CHARS.length];
  return s;
}

async function uniqueOrderId(env) {
  for (let i = 0; i < 10; i++) {
    const id = makeOrderId();
    const row = await env.DB.prepare('SELECT id FROM orders WHERE id=?').bind(id).first();
    if (!row) return id;
  }
  return 'OF-' + Date.now().toString(36).toUpperCase();
}

// ===== Public: create order =====
export async function onRequestPost({ request, env }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ অনুরোধ' }, 400);
  }

  const customer_name = cleanStr(body.customer_name, 80);
  const phone = cleanStr(body.phone, 20);
  const address = cleanStr(body.address, 300);
  const district = cleanStr(body.district, 40);
  const payment = cleanStr(body.payment, 20);
  const items = body.items;

  if (customer_name.length < 3) return json({ error: 'আপনার নাম লিখুন' }, 400);
  if (!/^01[3-9]\d{8}$/.test(phone)) return json({ error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' }, 400);
  if (address.length < 10) return json({ error: 'সম্পূর্ণ ঠিকানা লিখুন' }, 400);
  if (!DISTRICTS.includes(district)) return json({ error: 'জেলা নির্বাচন করুন' }, 400);
  if (!PAYMENTS.includes(payment)) return json({ error: 'পেমেন্ট মাধ্যম নির্বাচন করুন' }, 400);
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return json({ error: 'কার্টে কোনো পণ্য নেই' }, 400);
  }

  try {
    // Fetch settings for delivery charge (server-side, never trust client)
    const delRows = await env.DB.prepare(
      "SELECT key, value FROM settings WHERE key IN ('delivery_inside','delivery_outside')"
    ).all();
    const sMap = {};
    (delRows.results || []).forEach((r) => (sMap[r.key] = r.value));
    const deliveryInside = parseInt(sMap.delivery_inside, 10);
    const deliveryOutside = parseInt(sMap.delivery_outside, 10);
    const delivery = district === 'ঢাকা'
      ? (Number.isFinite(deliveryInside) ? deliveryInside : 60)
      : (Number.isFinite(deliveryOutside) ? deliveryOutside : 120);

    // Recompute totals from D1 product prices — never trust client totals
    let subtotal = 0;
    const orderItems = [];
    for (const it of items) {
      const pid = clampInt(it.id, 1, 1000000000);
      const qty = clampInt(it.qty, 1, 10);
      const size = cleanStr(it.size, 20);
      if (!pid) return json({ error: 'অবৈধ পণ্য' }, 400);
      const p = await env.DB.prepare('SELECT id, name, price, sizes, stock FROM products WHERE id=?').bind(pid).first();
      if (!p) return json({ error: 'একটি পণ্য আর পাওয়া যাচ্ছে না' }, 400);
      let sizes = [];
      try {
        sizes = JSON.parse(p.sizes || '[]');
      } catch { sizes = []; }
      if (!sizes.includes(size)) return json({ error: `“${p.name}” পণ্যের সাইজ সঠিক নয়` }, 400);
      if (p.stock < qty) return json({ error: `“${p.name}” স্টকে পর্যাপ্ত নেই` }, 400);
      subtotal += p.price * qty;
      orderItems.push({ id: p.id, name: p.name, price: p.price, size, qty });
    }
    if (subtotal <= 0) return json({ error: 'অর্ডারের পরিমাণ সঠিক নয়' }, 400);
    const total = subtotal + delivery;

    const id = await uniqueOrderId(env);
    await env.DB.prepare(
      `INSERT INTO orders (id, customer_name, phone, address, district, payment, items_json, subtotal, delivery, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(id, customer_name, phone, address, district, payment, JSON.stringify(orderItems), subtotal, delivery, total)
      .run();

    // Decrement stock (best-effort)
    for (const it of orderItems) {
      try {
        await env.DB.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id=?').bind(it.qty, it.id).run();
      } catch { /* ignore */ }
    }

    return json({ ok: true, id, total, delivery });
  } catch {
    return json({ error: 'অর্ডার করা যায়নি, পরে আবার চেষ্টা করুন' }, 500);
  }
}

// ===== Admin: list orders =====
export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const status = new URL(request.url).searchParams.get('status') || '';
  try {
    let stmt;
    if (ORDER_STATUSES.includes(status)) {
      stmt = env.DB.prepare('SELECT * FROM orders WHERE status=? ORDER BY created_at DESC LIMIT 300').bind(status);
    } else {
      stmt = env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 300');
    }
    const { results } = await stmt.all();
    return json({ orders: results || [] });
  } catch {
    return json({ error: 'অর্ডার লোড করা যায়নি' }, 500);
  }
}

// ===== Admin: update order status =====
export async function onRequestPut({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const id = cleanStr(new URL(request.url).searchParams.get('id'), 20);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ ডেটা' }, 400);
  }
  const status = cleanStr(body.status, 20);
  if (!/^OF-[A-Z0-9]{6,12}$/.test(id)) return json({ error: 'অবৈধ অর্ডার আইডি' }, 400);
  if (!ORDER_STATUSES.includes(status)) return json({ error: 'অবৈধ স্ট্যাটাস' }, 400);
  try {
    const res = await env.DB.prepare('UPDATE orders SET status=? WHERE id=?').bind(status, id).run();
    if (res.meta.changes === 0) return json({ error: 'অর্ডার পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'আপডেট করা যায়নি' }, 500);
  }
}
