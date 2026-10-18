import { currentUser } from './_lib.js';

export default async function handler(req, res) {
  const u = await currentUser(req);
  res.json({ username: u ? u.username : null });
}
