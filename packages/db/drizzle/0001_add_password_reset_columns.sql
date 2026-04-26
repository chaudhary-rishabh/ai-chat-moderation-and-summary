ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;

CREATE INDEX IF NOT EXISTS users_reset_token_idx ON users(password_reset_token);
