CREATE TABLE IF NOT EXISTS public.business_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invited_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_invitations_invited_user_id
  ON public.business_invitations(invited_user_id);

CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id
  ON public.business_invitations(business_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_invitations_pending_unique
  ON public.business_invitations(business_id, invited_user_id)
  WHERE status = 'pending';

ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read relevant business invitations" ON public.business_invitations;
CREATE POLICY "Users read relevant business invitations"
  ON public.business_invitations FOR SELECT TO authenticated
  USING (
    invited_user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners create business invitations" ON public.business_invitations;
CREATE POLICY "Owners create business invitations"
  ON public.business_invitations FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Invitees update own business invitations" ON public.business_invitations;
CREATE POLICY "Invitees update own business invitations"
  ON public.business_invitations FOR UPDATE TO authenticated
  USING (
    invited_user_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    invited_user_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Owners update business invitations" ON public.business_invitations;
CREATE POLICY "Owners update business invitations"
  ON public.business_invitations FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

GRANT ALL ON public.business_invitations TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.business_invitations TO authenticated;
