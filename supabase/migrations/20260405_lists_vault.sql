-- Lists data table (stores full lists JSON per user/family)
CREATE TABLE IF NOT EXISTS lists_data (
  user_id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  data      JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE lists_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lists" ON lists_data FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Vault documents table
CREATE TABLE IF NOT EXISTS vault_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id  UUID REFERENCES families(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  emoji      TEXT DEFAULT '📄',
  member_id  UUID REFERENCES members(id) ON DELETE SET NULL,
  file_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family vault access" ON vault_documents FOR ALL TO authenticated
  USING (user_id = auth.uid() OR family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = auth.uid());

-- Supabase Storage bucket for documents (run separately in dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;
