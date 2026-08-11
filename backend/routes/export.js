import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { pool } from '../db/pool.js';
import XLSX from 'xlsx';

const r = Router();

function sendWorkbook(res, data, filename) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Food Tracker');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buf);
}

// Normal user: export only their own records
r.get('/', auth, async (req,res) => {
  try {
    const q = await pool.query(`
      SELECT meal_date AS date, breakfast, lunch, dinner, snacks, notes
      FROM meal_records
      WHERE user_id=$1
      ORDER BY meal_date
    `, [req.user.id]);

    const data = q.rows.map(x => ({
      Date: String(x.date),
      Breakfast: x.breakfast ? 'Yes' : 'No',
      Lunch: x.lunch ? 'Yes' : 'No',
      Dinner: x.dinner ? 'Yes' : 'No',
      Snacks: x.snacks ? 'Yes' : 'No',
      Notes: x.notes || ''
    }));

    sendWorkbook(res, data, 'food-tracker.xlsx');
  } catch (e) {
    console.error(e);
    res.status(500).json({error:'Could not export data'});
  }
});

// Admin: export ALL users and ALL meal records
r.get('/all', auth, admin, async (req,res) => {
  try {
    const q = await pool.query(`
      SELECT
        u.name,
        u.email,
        u.role,
        m.meal_date AS date,
        m.breakfast,
        m.lunch,
        m.dinner,
        m.snacks,
        m.notes
      FROM meal_records m
      JOIN users u ON u.id=m.user_id
      ORDER BY m.meal_date DESC, u.name ASC
    `);

    const data = q.rows.map(x => ({
      Name: x.name,
      Email: x.email,
      Role: x.role,
      Date: String(x.date),
      Breakfast: x.breakfast ? 'Yes' : 'No',
      Lunch: x.lunch ? 'Yes' : 'No',
      Dinner: x.dinner ? 'Yes' : 'No',
      Snacks: x.snacks ? 'Yes' : 'No',
      Notes: x.notes || ''
    }));

    sendWorkbook(res, data, 'food-tracker-all-users.xlsx');
  } catch (e) {
    console.error(e);
    res.status(500).json({error:'Could not export all user data'});
  }
});

export default r;
