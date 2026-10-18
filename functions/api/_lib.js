// Shared helpers for ORBITO FASHION API (Cloudflare Pages Functions + D1)

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function getClientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim() ||
    '0.0.0.0'
  );
}

export function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)orbito_session=([^;]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

export async function requireAdmin(request, env) {
  const token = getSessionToken(request);
  if (!token || !/^[0-9a-fA-F-]{36}$/.test(token)) return null;
  try {
    const row = await env.DB.prepare(
      'SELECT token FROM sessions WHERE token = ? AND expires_at > ?'
    )
      .bind(token, Math.floor(Date.now() / 1000))
      .first();
    return row ? token : null;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  return `orbito_session=${encodeURIComponent(token)}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return 'orbito_session=deleted; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison to avoid timing attacks on the password hash.
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function clampInt(v, min, max, fallback = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function cleanStr(v, maxLen) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen);
}

export const DISTRICTS = [
  'ঢাকা','গাজীপুর','নারায়ণগঞ্জ','নরসিংদী','মানিকগঞ্জ','টাঙ্গাইল','ফরিদপুর','মাদারীপুর',
  'চট্টগ্রাম','কক্সবাজার','কুমিল্লা','ফেনী','নোয়াখালী',
  'সিলেট','রাজশাহী','বগুড়া','পাবনা','রংপুর','দিনাজপুর',
  'খুলনা','যশোর','কুষ্টিয়া','বরিশাল','ময়মনসিংহ',
];

export const PAYMENTS = ['cod', 'bkash', 'nagad'];
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
