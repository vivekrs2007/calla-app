-- ── Catch Items: inbound email storage ──────────────────────────────────────
-- Run this in Supabase SQL Editor

-- 1. Add catch_prefix column to profiles so receive-email can reverse-lookup user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS catch_prefix TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_catch_prefix_idx ON profiles(catch_prefix) WHERE catch_prefix IS NOT NULL;

-- 2. Create catch_items table
CREATE TABLE IF NOT EXISTS catch_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID        REFERENCES families(id) ON DELETE CASCADE,
  catch_prefix   TEXT        NOT NULL,
  from_address   TEXT        NOT NULL DEFAULT '',
  from_name      TEXT        NOT NULL DEFAULT '',
  subject        TEXT        NOT NULL DEFAULT '(No subject)',
  body_text      TEXT        NOT NULL DEFAULT '',
  received_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed      BOOLEAN     NOT NULL DEFAULT FALSE,
  processed_at   TIMESTAMPTZ
);

-- 3. Row-level security
ALTER TABLE catch_items ENABLE ROW LEVEL SECURITY;

-- Family members can read their own items
CREATE POLICY "family_read_catch_items" ON catch_items
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    OR catch_prefix = (SELECT catch_prefix FROM profiles WHERE id = auth.uid())
  );

-- Service role inserts (from edge function — uses service key, bypasses RLS anyway)
-- But add a permissive insert policy in case anon key is used
CREATE POLICY "service_insert_catch_items" ON catch_items
  FOR INSERT WITH CHECK (TRUE);

-- Family members can update (mark processed)
CREATE POLICY "family_update_catch_items" ON catch_items
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    OR catch_prefix = (SELECT catch_prefix FROM profiles WHERE id = auth.uid())
  );

-- Family members can delete
CREATE POLICY "family_delete_catch_items" ON catch_items
  FOR DELETE USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    OR catch_prefix = (SELECT catch_prefix FROM profiles WHERE id = auth.uid())
  );

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS catch_items_family_id_idx    ON catch_items(family_id);
CREATE INDEX IF NOT EXISTS catch_items_prefix_idx       ON catch_items(catch_prefix);
CREATE INDEX IF NOT EXISTS catch_items_received_at_idx  ON catch_items(received_at DESC);
