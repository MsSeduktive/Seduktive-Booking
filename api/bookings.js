import { db, currentUser, bad } from './_lib.js';

const s = (v, max) => (v == null || v === '' ? null : String(v).slice(0, max));

export default async function handler(req, res) {
  const user = await currentUser(req);
  if (!user) return bad(res, 401, 'Log in first.');

  if (req.method === 'GET') {
    const { data, error } = await db.from('bookings')
      .select('id, service, option, total, deposit, status, preferred_date, created_at')
      .eq('user_id', user.uid).order('created_at', { ascending: false }).limit(50);
    if (error) return bad(res, 500, 'Could not load bookings.');
    return res.json({ bookings: data });
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    const total = Number(b.total), deposit = Number(b.deposit);
    if (!b.service || !b.option) return bad(res, 400, 'Choose a service first.');
    if (!(total > 0 && total < 5000) || !(deposit > 0 && deposit <= total)) return bad(res, 400, 'Invalid price.');

    // simple spam guard: max 10 bookings per user per hour
    const since = new Date(Date.now() - 3600000).toISOString();
    const { count } = await db.from('bookings').select('id', { count: 'exact', head: true })
      .eq('user_id', user.uid).gte('created_at', since);
    if ((count || 0) >= 10) return bad(res, 429, 'Too many requests. Try again later.');

    const row = {
      user_id: user.uid,
      service: s(b.service, 60), option: s(b.option, 80),
      total, deposit,
      app: s(b.app, 40), handle: s(b.handle, 80), nickname: s(b.nickname, 60),
      preferred_date: /^\d{4}-\d{2}-\d{2}$/.test(b.preferred_date || '') ? b.preferred_date : null,
      preferred_time: s(b.preferred_time, 20),
      area: s(b.area, 120), book_with: s(b.book_with, 60), delivery: s(b.delivery, 80),
      notes: s(b.notes, 2000), request_text: s(b.request_text, 4000)
    };
    const { data, error } = await db.from('bookings').insert(row).select('id').single();
    if (error) return bad(res, 500, 'Could not save booking.');
    return res.json({ id: data.id });
  }

  bad(res, 405, 'Method not allowed');
}
