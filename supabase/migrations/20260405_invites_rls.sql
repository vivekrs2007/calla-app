-- ── Invites table: secure RLS — no anon direct reads ─────────────────────
-- Anon SELECT was required for the invite landing page but exposed ALL pending
-- invites (email + tokens) to anyone who queried without a filter.
-- Fix: drop the anon policy. Invite lookup is now done via the get-invite
-- edge function (service role, requires token as input).

-- Remove the insecure anon read policy
DROP POLICY IF EXISTS "Public invite lookup by token" ON invites;

-- Authenticated users can read invites (needed by acceptInvite after sign-in)
DROP POLICY IF EXISTS "Authenticated invite read" ON invites;
CREATE POLICY "Authenticated invite read"
  ON invites FOR SELECT
  TO authenticated
  USING (true);
