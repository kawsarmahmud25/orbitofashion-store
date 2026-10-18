import { json, requireAdmin } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const token = await requireAdmin(request, env);
  if (!token) return json({ ok: false }, 401);
  return json({ ok: true });
}
