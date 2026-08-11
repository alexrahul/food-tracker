import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import auth from './routes/auth.js';
import meals from './routes/meals.js';
import exportRoute from './routes/export.js';
import adminRoute from './routes/admin.js';

dotenv.config();
const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',').map(x => x.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.get('/api/health', (req,res) => res.json({ok:true}));
app.use('/api/auth', auth);
app.use('/api/meals', meals);
app.use('/api/export', exportRoute);
app.use('/api/admin', adminRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Food Tracker API running on port ${PORT}`));
