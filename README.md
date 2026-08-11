# Food Tracker — CockroachDB + PostgreSQL-compatible API

## Stack
Frontend: HTML/CSS/JavaScript
Backend: Node.js + Express
Database: CockroachDB using PostgreSQL-compatible `pg` driver
Export: XLSX

## 1. Backend setup
cd backend
npm install
copy .env.example .env

Edit `.env` and put your CockroachDB connection string into `DATABASE_URL`.
Do not commit `.env`.

## 2. Create tables
Use CockroachDB SQL Console or the Cockroach SQL client and run:
`db/schema.sql`

## 3. Start API
npm start

The API will run at http://localhost:3000

## 4. Run frontend
Serve the `frontend` folder with a local static server (for example VS Code Live Server).
Open the generated URL, then register a user.

## Important
The connection string is a secret. Never paste the real password into source code or GitHub.
For production, set DATABASE_URL, JWT_SECRET and CORS_ORIGIN as deployment environment variables.
"# food-tracker" 
"# food-tracker" 
