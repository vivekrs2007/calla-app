-- Lists data table (stores full lists JSON per user/family)
CREATE TABLE IF NOT EXISTS lists_data (
  user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  data      JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE lists_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lists" ON lists_data FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
