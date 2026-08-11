import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const r = Router();
r.use(auth, admin);

r.get('/stats', async (req,res) => {
  const q = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)::INT AS total_users,
      (SELECT COUNT(*) FROM meal_records)::INT AS total_records,
      (SELECT COALESCE(SUM(CASE WHEN breakfast THEN 1 ELSE 0 END),0)::INT FROM meal_records) AS breakfasts,
      (SELECT COALESCE(SUM(CASE WHEN lunch THEN 1 ELSE 0 END),0)::INT FROM meal_records) AS lunches,
      (SELECT COALESCE(SUM(CASE WHEN dinner THEN 1 ELSE 0 END),0)::INT FROM meal_records) AS dinners,
      (SELECT COALESCE(SUM(CASE WHEN snacks THEN 1 ELSE 0 END),0)::INT FROM meal_records) AS snacks`);
  res.json(q.rows[0]);
});

r.get('/users', async (req,res) => {
  const q = await pool.query(`
    SELECT u.id,u.name,u.email,u.role,u.created_at,COUNT(m.id)::INT AS records
    FROM users u LEFT JOIN meal_records m ON m.user_id=u.id
    GROUP BY u.id ORDER BY u.created_at DESC`);
  res.json(q.rows);
});

r.post('/users', async (req,res) => {
  try {
    const {name,email,password,role='user'} = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({error:'Name, email and 8+ character password are required'});
    if (!['user','admin'].includes(role))
      return res.status(400).json({error:'Invalid role'});
    const hash = await bcrypt.hash(password,12);
    const q = await pool.query(
      'INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role',
      [name,email.toLowerCase(),hash,role]);
    res.status(201).json(q.rows[0]);
  } catch(e) {
    if(e.code === '23505') return res.status(409).json({error:'Email already registered'});
    res.status(500).json({error:'Could not create user'});
  }
});

r.patch('/users/:id', async (req,res) => {
  const {name,email,role} = req.body;
  if (role && !['user','admin'].includes(role))
    return res.status(400).json({error:'Invalid role'});
  if (req.params.id === req.user.id && role === 'user')
    return res.status(400).json({error:'You cannot remove your own admin access'});
  const q = await pool.query(
    `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),
     role=COALESCE($3,role) WHERE id=$4
     RETURNING id,name,email,role`,
    [name,email?.toLowerCase(),role,req.params.id]);
  if(!q.rowCount) return res.status(404).json({error:'User not found'});
  res.json(q.rows[0]);
});

r.delete('/users/:id', async (req,res) => {
  if(req.params.id === req.user.id)
    return res.status(400).json({error:'You cannot delete your own account'});
  const q = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id',[req.params.id]);
  if(!q.rowCount) return res.status(404).json({error:'User not found'});
  res.json({ok:true});
});

r.get('/meals', async (req,res) => {
  const q = await pool.query(`
    SELECT m.id,m.user_id,u.name,u.email,m.meal_date,m.breakfast,m.lunch,m.dinner,m.snacks,m.notes
    FROM meal_records m JOIN users u ON u.id=m.user_id
    ORDER BY m.meal_date DESC,m.updated_at DESC`);
  res.json(q.rows);
});

r.delete('/meals/:id', async (req,res) => {
  const q = await pool.query('DELETE FROM meal_records WHERE id=$1 RETURNING id',[req.params.id]);
  if(!q.rowCount) return res.status(404).json({error:'Meal record not found'});
  res.json({ok:true});
});

export default r;
