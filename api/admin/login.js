import { timingSafeEqual } from 'node:crypto';
import { sign, setCookie, bad } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  const given = Buffer.from(String((req.body || {}).password || ''));
  const real = Buffer.from(String(process.env.ADMIN_PASSWORD || ''));
  const ok = real.length > 0 && given.length === real.length && timingSafeEqual(given, real);
  if (!ok) return bad(res, 401, 'Wrong password.');
  setCookie(res, 'adm', await sign({ role: 'admin' }, 7), 7 * 86400);
  res.json({ ok: true });
}
