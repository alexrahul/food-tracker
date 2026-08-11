import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool} from '../db/pool.js';
const r=Router();
const sign=u=>jwt.sign({id:u.id,email:u.email},process.env.JWT_SECRET,{expiresIn:'7d'});
r.post('/register',async(req,res)=>{
 try{
  const {name,email,password}=req.body;
  if(!name||!email||!password||password.length<8)return res.status(400).json({error:'Name, email and 8+ character password are required'});
  const hash=await bcrypt.hash(password,12);
  const q=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email',[name,email.toLowerCase(),hash]);
  res.status(201).json({user:q.rows[0],token:sign(q.rows[0])});
 }catch(e){if(e.code==='23505')return res.status(409).json({error:'Email already registered'});res.status(500).json({error:'Registration failed'});}
});
r.post('/login',async(req,res)=>{
 try{
  const {email,password}=req.body; const q=await pool.query('SELECT * FROM users WHERE email=$1',[email.toLowerCase()]);
  if(!q.rowCount||!(await bcrypt.compare(password,q.rows[0].password_hash)))return res.status(401).json({error:'Invalid email or password'});
  const u=q.rows[0]; res.json({user:{id:u.id,name:u.name,email:u.email,role:u.role},token:sign(u)});
 }catch{res.status(500).json({error:'Login failed'});}
});
export default r;