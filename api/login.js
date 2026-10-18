import bcrypt from 'bcryptjs';
import { db, sign, setCookie, bad } from './_lib.js';

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const { username, pin } = req.body || {};
  const u = String(username || '').trim().toLowerCase();
  const p = String(pin || '');
  if (!u || !/^\d{4}$/.test(p)) return bad(res, 400, 'Enter your username and 4-digit PIN.');

  const { data: user } = await db.from('users').select('*').eq('username', u).maybeSingle();
  if (!user) return bad(res, 401, 'Wrong username or PIN.');

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return bad(res, 429, 'Too many tries. Wait 15 minutes and try again.');
  }

  const ok = await bcrypt.compare(p, user.pin_hash);
  if (!ok) {
    const fails = user.failed_attempts + 1;
    const patch = fails >= MAX_FAILS
      ? { failed_attempts: 0, locked_until: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() }
      : { failed_attempts: fails };
    await db.from('users').update(patch).eq('id', user.id);
    return bad(res, 401, 'Wrong username or PIN.');
  }

  await db.from('users').update({ failed_attempts: 0, locked_until: null }).eq('id', user.id);
  setCookie(res, 'sid', await sign({ role: 'user', uid: user.id, username: user.username }, 30), 30 * 86400);
  res.json({ username: user.username });
}
