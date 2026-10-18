import { json, requireAdmin, cleanStr, clampInt } from './_lib.js';

const ALLOWED_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', 'ফ্রি সাইজ'];

function parseSizes(v) {
  if (!Array.isArray(v)) return null;
  const out = v.map((s) => String(s).trim()).filter((s) => ALLOWED_SIZES.includes(s));
  if (!out.length) return null;
  return [...new Set(out)];
}

function validateProduct(body) {
  const errors = [];
  const name = cleanStr(body.name, 120);
  if (name.length < 2) errors.push('নামের দৈর্ঘ্য কমপক্ষে ২ অক্ষর হতে হবে');
  const category_id = clampInt(body.category_id, 0, 1000000);
  const price = clampInt(body.price, 0, 100000000);
  if (price < 0) errors.push('দাম সঠিক নয়');
  const old_price = clampInt(body.old_price || 0, 0, 100000000);
  const image = cleanStr(body.image, 2000);
  const badge = cleanStr(body.badge, 40);
  const sizes = parseSizes(body.sizes);
  if (!sizes) errors.push('অন্তত একটি বৈধ সাইজ দিন');
  const stock = clampInt(body.stock ?? 100, 0, 1000000);
  const description = cleanStr(body.description, 5000);
  const is_trending = body.is_trending ? 1 : 0;
  const is_new = body.is_new ? 1 : 0;
  return {
    errors,
    data: { name, category_id, price, old_price, image, badge, sizes: JSON.stringify(sizes), stock, description, is_trending, is_new },
  };
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.id DESC`
    ).all();
    return json({ products: results || [] });
  } catch {
    return json({ error: 'পণ্য লোড করা যায়নি' }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ ডেটা' }, 400);
  }
  const { errors, data } = validateProduct(body);
  if (errors.length) return json({ error: errors.join(', ') }, 400);
  try {
    const res = await env.DB.prepare(
      `INSERT INTO products (name, category_id, price, old_price, image, badge, sizes, stock, description, is_trending, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(data.name, data.category_id, data.price, data.old_price, data.image, data.badge, data.sizes, data.stock, data.description, data.is_trending, data.is_new)
      .run();
    return json({ ok: true, id: res.meta.last_row_id });
  } catch {
    return json({ error: 'সংরক্ষণ করা যায়নি' }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const id = clampInt(new URL(request.url).searchParams.get('id'), 1, 1000000000);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ ডেটা' }, 400);
  }
  const { errors, data } = validateProduct(body);
  if (errors.length) return json({ error: errors.join(', ') }, 400);
  try {
    const res = await env.DB.prepare(
      `UPDATE products SET name=?, category_id=?, price=?, old_price=?, image=?, badge=?, sizes=?, stock=?, description=?, is_trending=?, is_new=? WHERE id=?`
    )
      .bind(data.name, data.category_id, data.price, data.old_price, data.image, data.badge, data.sizes, data.stock, data.description, data.is_trending, data.is_new, id)
      .run();
    if (res.meta.changes === 0) return json({ error: 'পণ্য পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'আপডেট করা যায়নি' }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const id = clampInt(new URL(request.url).searchParams.get('id'), 1, 1000000000);
  try {
    const res = await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
    if (res.meta.changes === 0) return json({ error: 'পণ্য পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'মোছা যায়নি' }, 500);
  }
}
