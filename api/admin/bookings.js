import { db, isAdmin, bad } from '../_lib.js';

const STATUSES = ['pending', 'confirmed', 'paid', 'completed', 'cancelled'];

export default async function handler(req, res) {
  if (!(await isAdmin(req))) return bad(res, 401, 'Admin login required.');

  if (req.method === 'GET') {
    let q = db.from('bookings').select('*, users(username)').order('created_at', { ascending: false }).limit(500);
    const st = req.query.status;
    if (st && STATUSES.includes(st)) q = q.eq('status', st);
    const { data, error } = await q;
    if (error) return bad(res, 500, 'Could not load bookings.');
    return res.json({ bookings: data });
  }

  if (req.method === 'PATCH') {
    const { id, status, admin_note } = req.body || {};
    if (!id) return bad(res, 400, 'Missing id.');
    const patch = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return bad(res, 400, 'Bad status.');
      patch.status = status;
    }
    if (admin_note !== undefined) patch.admin_note = String(admin_note).slice(0, 2000);
    const { error } = await db.from('bookings').update(patch).eq('id', id);
    if (error) return bad(res, 500, 'Could not update.');
    return res.json({ ok: true });
  }

  bad(res, 405, 'Method not allowed');
}
