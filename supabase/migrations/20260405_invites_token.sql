-- ── Invites table: ensure token column exists ────────────────────────────
-- Run this in Supabase SQL Editor if invites table was created without a token column.

-- Add token column if missing
ALTER TABLE invites ADD COLUMN IF NOT EXISTS token TEXT;

-- Backfill any rows that have no token
UPDATE invites SET token = gen_random_uuid()::text WHERE token IS NULL;

-- Add unique index so token lookups are fast and can't collide
CREATE UNIQUE INDEX IF NOT EXISTS invites_token_idx ON invites(token) WHERE token IS NOT NULL;
