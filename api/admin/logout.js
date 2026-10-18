import { setCookie } from '../_lib.js';

export default function handler(req, res) {
  setCookie(res, 'adm', '', 0);
  res.json({ ok: true });
}
