import { setCookie } from './_lib.js';

export default function handler(req, res) {
  setCookie(res, 'sid', '', 0);
  res.json({ ok: true });
}
