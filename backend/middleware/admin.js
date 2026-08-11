import { pool } from '../db/pool.js';

export async function admin(req, res, next) {
  try {
    const q = await pool.query('SELECT role FROM users WHERE id=$1', [req.user.id]);
    if (!q.rowCount || q.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Unable to verify admin access' });
  }
}
