CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name STRING NOT NULL,
  email STRING UNIQUE NOT NULL,
  password_hash STRING NOT NULL,
  role STRING NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role STRING NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS meal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  breakfast BOOL NOT NULL DEFAULT false,
  lunch BOOL NOT NULL DEFAULT false,
  dinner BOOL NOT NULL DEFAULT false,
  snacks BOOL NOT NULL DEFAULT false,
  notes STRING NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, meal_date)
);

CREATE INDEX IF NOT EXISTS meal_records_user_date_idx
ON meal_records(user_id, meal_date DESC);