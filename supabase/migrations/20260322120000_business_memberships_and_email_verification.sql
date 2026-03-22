-- ============================================================
-- Business memberships + onboarding support
-- Allows users to belong to multiple businesses via memberships.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

ALTER TABLE public.business_memberships ENABLE ROW LEVEL SECURITY;

-- Ensure owner membership exists for all existing rows.
INSERT INTO public.business_memberships (business_id, user_id, role)
SELECT id, user_id, 'owner' FROM public.businesses
ON CONFLICT (business_id, user_id) DO NOTHING;

-- Keep owner membership in sync whenever a business is created.
CREATE OR REPLACE FUNCTION public.ensure_owner_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.business_memberships (business_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (business_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_owner_membership ON public.businesses;
CREATE TRIGGER trg_ensure_owner_membership
AFTER INSERT ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.ensure_owner_membership();

CREATE OR REPLACE FUNCTION public.can_access_business(target_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1
    FROM public.businesses b
    LEFT JOIN public.business_memberships bm ON bm.business_id = b.id
    WHERE b.id = target_business_id
      AND (b.user_id = auth.uid() OR bm.user_id = auth.uid())
  );
$$;

-- Membership table policies.
DROP POLICY IF EXISTS "Users read relevant memberships" ON public.business_memberships;
CREATE POLICY "Users read relevant memberships"
  ON public.business_memberships FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners manage memberships" ON public.business_memberships;
CREATE POLICY "Owners manage memberships"
  ON public.business_memberships FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners update memberships" ON public.business_memberships;
CREATE POLICY "Owners update memberships"
  ON public.business_memberships FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "Owners delete memberships" ON public.business_memberships;
CREATE POLICY "Owners delete memberships"
  ON public.business_memberships FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND b.user_id = auth.uid()
    )
  );

-- Extend businesses access for assigned members.
DROP POLICY IF EXISTS "Members read assigned businesses" ON public.businesses;
CREATE POLICY "Members read assigned businesses"
  ON public.businesses FOR SELECT TO authenticated
  USING (public.can_access_business(id));

DROP POLICY IF EXISTS "Members update assigned businesses" ON public.businesses;
CREATE POLICY "Members update assigned businesses"
  ON public.businesses FOR UPDATE TO authenticated
  USING (public.can_access_business(id))
  WITH CHECK (public.can_access_business(id));

GRANT ALL ON public.business_memberships TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_memberships TO authenticated;
