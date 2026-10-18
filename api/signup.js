import bcrypt from 'bcryptjs';
import { db, sign, setCookie, bad } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'POST only');
  const { username, pin } = req.body || {};
  const u = String(username || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return bad(res, 400, 'Username: 3 to 20 letters, numbers or underscore.');
  if (!/^\d{4}$/.test(String(pin || ''))) return bad(res, 400, 'PIN must be exactly 4 digits.');

  const pin_hash = await bcrypt.hash(String(pin), 10);
  const { data, error } = await db.from('users').insert({ username: u, pin_hash }).select('id, username').single();
  if (error) {
    if (error.code === '23505') return bad(res, 409, 'That username is taken.');
    return bad(res, 500, 'Could not create account.');
  }
  setCookie(res, 'sid', await sign({ role: 'user', uid: data.id, username: data.username }, 30), 30 * 86400);
  res.json({ username: data.username });
}
