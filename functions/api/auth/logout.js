import { json, getSessionToken, clearSessionCookie } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const token = getSessionToken(request);
  if (token) {
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    } catch { /* ignore */ }
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
