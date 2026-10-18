import { json, requireAdmin, cleanStr, clampInt } from './_lib.js';

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM sliders ORDER BY sort ASC, id ASC').all();
    return json({ sliders: results || [] });
  } catch {
    return json({ error: 'স্লাইডার লোড করা যায়নি' }, 500);
  }
}

function validate(body) {
  const errors = [];
  const image = cleanStr(body.image, 2000);
  const badge = cleanStr(body.badge, 40);
  const title = cleanStr(body.title, 140);
  const subtitle = cleanStr(body.subtitle, 220);
  const button_text = cleanStr(body.button_text, 40) || 'এখনই কিনুন';
  const sort = clampInt(body.sort || 0, 0, 1000000);
  if (!image) errors.push('ছবির লিংক দিন');
  if (!title) errors.push('শিরোনাম দিন');
  return { errors, data: { image, badge, title, subtitle, button_text, sort } };
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'অবৈধ ডেটা' }, 400);
  }
  const { errors, data } = validate(body);
  if (errors.length) return json({ error: errors.join(', ') }, 400);
  try {
    const res = await env.DB.prepare(
      'INSERT INTO sliders (image, badge, title, subtitle, button_text, sort) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(data.image, data.badge, data.title, data.subtitle, data.button_text, data.sort).run();
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
  const { errors, data } = validate(body);
  if (errors.length) return json({ error: errors.join(', ') }, 400);
  try {
    const res = await env.DB.prepare(
      'UPDATE sliders SET image=?, badge=?, title=?, subtitle=?, button_text=?, sort=? WHERE id=?'
    ).bind(data.image, data.badge, data.title, data.subtitle, data.button_text, data.sort, id).run();
    if (res.meta.changes === 0) return json({ error: 'স্লাইড পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'আপডেট করা যায়নি' }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ error: 'লগইন প্রয়োজন' }, 401);
  const id = clampInt(new URL(request.url).searchParams.get('id'), 1, 1000000000);
  try {
    const res = await env.DB.prepare('DELETE FROM sliders WHERE id=?').bind(id).run();
    if (res.meta.changes === 0) return json({ error: 'স্লাইড পাওয়া যায়নি' }, 404);
    return json({ ok: true });
  } catch {
    return json({ error: 'মোছা যায়নি' }, 500);
  }
}
