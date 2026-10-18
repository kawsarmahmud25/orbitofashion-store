import { json, getClientIp, sha256Hex, timingSafeEqual, sessionCookie } from '../_lib.js';

const WINDOW_SEC = 600; // 10 minutes
const MAX_ATTEMPTS = 5;

async function recordFail(env, ip, row, now) {
  const attempts = row ? row.attempts + 1 : 1;
  await env.DB.prepare(
    `INSERT INTO login_attempts (ip, attempts, last_attempt) VALUES (?, ?, ?)
     ON CONFLICT(ip) DO UPDATE SET attempts=excluded.attempts, last_attempt=excluded.last_attempt`
  )
    .bind(ip, attempts, now)
    .run();
}

export async function onRequestPost({ request, env }) {
  const ip = getClientIp(request);
  const now = Math.floor(Date.now() / 1000);

  try {
    const row = await env.DB.prepare(
      'SELECT attempts, last_attempt FROM login_attempts WHERE ip = ?'
    )
      .bind(ip)
      .first();

    if (row && row.attempts >= MAX_ATTEMPTS && now - row.last_attempt < WINDOW_SEC) {
      return json({ error: 'অনেকবার ভুল চেষ্টা হয়েছে। ১০ মিনিট পরে আবার চেষ্টা করুন।' }, 429);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: 'অবৈধ অনুরোধ' }, 400);
    }
    const password = typeof body.password === 'string' ? body.password : '';

    const salt = env.ADMIN_SALT || '';
    const expected = env.ADMIN_PASSWORD_HASH || '';
    let ok = false;
    if (password && password.length <= 200 && salt && expected) {
      const got = await sha256Hex(salt + password);
      ok = timingSafeEqual(got, expected.toLowerCase());
    }

    if (!ok) {
      await recordFail(env, ip, row, now);
      return json({ error: 'ভুল পাসওয়ার্ড' }, 401);
    }

    // Success: reset attempts and issue session
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();
    const token = crypto.randomUUID();
    const expires = now + 12 * 3600;
    await env.DB.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expires).run();
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
    } catch { /* ignore cleanup errors */ }

    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
  } catch (e) {
    return json({ error: 'সার্ভার সমস্যা, পরে আবার চেষ্টা করুন' }, 500);
  }
}
