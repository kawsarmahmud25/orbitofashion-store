import { json, requireAdmin, cleanStr, clampInt } from './_lib.js';

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY sort ASC, id ASC').all();
    return json({ categories: results || [] });
  } catch {
    return json({ error: 'ক্যাটাগরি লোড করা যায়নি' }, 500);
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
  const name = cleanStr(body.name, 60);
  const image = cleanStr(body.image, 2000);
  const sort = clampInt(body.sort || 0, 0, 1000000);
  if (name.length < 2) return json({ error: 'ক্যাটাগরির নাম দিন' }, 400);
  try {
    const res = await env.DB.prepare('INSERT INTO categories (name, image, sort) VALUES (?, ?, ?)').bind(name, image, sort).run();
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
  const name = cleanStr(body.name, 60);
  const image = cleanStr(body.image, 2000);
  const sort = clampInt(body.sort || 0, 0, 1000000);
  if (name.length < 2) return json({ error: 'ক্যাটাগরির নাম দিন' }, 400);
  try {
    const res = await env.DB.prepare('UPDATE categories SET name=?, image=?, sort=? WHERE id=?').bind(name, image, sort, id).run();
    if (res.meta.changes === 0) return json({ error: 'ক্যাটাগরি পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'আপডেট করা যায়নি' }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const id = clampInt(new URL(request.url).searchParams.get('id'), 1, 1000000000);
  try {
    const used = await env.DB.prepare('SELECT id FROM products WHERE category_id=? LIMIT 1').bind(id).first();
    if (used) return json({ error: 'এই ক্যাটাগরিতে পণ্য আছে, আগে পণ্য সরান' }, 400);
    const res = await env.DB.prepare('DELETE FROM categories WHERE id=?').bind(id).run();
    if (res.meta.changes === 0) return json({ error: 'ক্যাটাগরি পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'মোছা যায়নি' }, 500);
  }
}
