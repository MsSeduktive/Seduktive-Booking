import { createClient } from '@supabase/supabase-js';
import { SignJWT, jwtVerify } from 'jose';

export const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET);

export const sign = (payload, days) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(days + 'd').sign(key());

export async function verify(token) {
  try { return (await jwtVerify(token, key())).payload; } catch { return null; }
}

export function readCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

export function setCookie(res, name, value, maxAgeSeconds) {
  res.setHeader('Set-Cookie',
    `${name}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`);
}

export async function currentUser(req) {
  const t = readCookies(req).sid;
  const p = t ? await verify(t) : null;
  return p && p.role === 'user' ? p : null;
}

export async function isAdmin(req) {
  const t = readCookies(req).adm;
  const p = t ? await verify(t) : null;
  return !!(p && p.role === 'admin');
}

export const bad = (res, code, msg) => res.status(code).json({ error: msg });
