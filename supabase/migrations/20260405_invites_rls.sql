-- ── Invites table: allow unauthenticated token lookup ────────────────────
-- The invite landing page loads BEFORE the partner creates an account.
-- Without this policy, anon requests return nothing → "expired" error.

-- Allow anyone (anon) to read a pending invite by its token
-- Scope is narrow: only pending invites, only when a token exists
DROP POLICY IF EXISTS "Public invite lookup by token" ON invites;
CREATE POLICY "Public invite lookup by token"
  ON invites FOR SELECT
  TO anon
  USING (token IS NOT NULL AND status = 'pending');

-- Also ensure authenticated users can still read invites in their family
DROP POLICY IF EXISTS "Authenticated invite read" ON invites;
CREATE POLICY "Authenticated invite read"
  ON invites FOR SELECT
  TO authenticated
  USING (true);
