import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import auth from './routes/auth.js';
import meals from './routes/meals.js';
import exportRoute from './routes/export.js';
import adminRoute from './routes/admin.js';

dotenv.config();

const app = express();

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // such as curl/Postman/server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            // Allow configured origins
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Reject unknown browser origins
            return callback(
                new Error('Not allowed by CORS')
            );
        },

        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);

// --------------------------------------------------
// JSON BODY PARSER
// --------------------------------------------------

app.use(express.json());

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
    res.json({
        ok: true
    });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/auth', auth);

app.use('/api/meals', meals);

app.use('/api/export', exportRoute);

app.use('/api/admin', adminRoute);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Food Tracker API running on port ${PORT}`);
});