# Admin Panel Setup

1. Run the updated `backend/db/schema.sql` in CockroachDB.
2. Promote your first trusted account using SQL:
   UPDATE users SET role='admin' WHERE email='YOUR_EMAIL';
3. Restart the backend.
4. Log out and log in again.
5. Admin users are redirected to `admin.html`.

Admin can:
- View global statistics
- Create users/admins
- Change roles
- Delete users and their meal records
- View all meal records
- Delete meal records

Never put the database password or JWT secret in frontend code or GitHub.
