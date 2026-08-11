import {Router} from 'express';
import {pool} from '../db/pool.js';
import {auth} from '../middleware/auth.js';
const r=Router(); r.use(auth);
r.get('/',async(req,res)=>{const {from,to}=req.query;const q=await pool.query('SELECT meal_date,bfast:=breakfast FROM meal_records WHERE user_id=$1 AND meal_date BETWEEN $2 AND $3 ORDER BY meal_date DESC',[req.user.id,from,to]);res.json(q.rows);});
r.get('/day/:date',async(req,res)=>{const q=await pool.query('SELECT meal_date,breakfast,lunch,dinner,snacks,notes FROM meal_records WHERE user_id=$1 AND meal_date=$2',[req.user.id,req.params.date]);res.json(q.rows[0]||{meal_date:req.params.date,breakfast:false,lunch:false,dinner:false,snacks:false,notes:''});});
r.put('/day/:date',async(req,res)=>{const {breakfast=false,lunch=false,dinner=false,snacks=false,notes=''}=req.body;const q=await pool.query(`INSERT INTO meal_records(user_id,meal_date,breakfast,lunch,dinner,snacks,notes) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(user_id,meal_date) DO UPDATE SET breakfast=$3,lunch=$4,dinner=$5,snacks=$6,notes=$7,updated_at=now() RETURNING meal_date,breakfast,lunch,dinner,snacks,notes`,[req.user.id,req.params.date,breakfast,lunch,dinner,snacks,notes]);res.json(q.rows[0]);});
export default r;