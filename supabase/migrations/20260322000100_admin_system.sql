-- ============================================================
-- Admin System Migration
-- Adds role/user_type/last_active to profiles,
-- status to businesses, and new admin tables.
-- ============================================================

-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS user_type text NOT NULL DEFAULT 'freelancer'
    CHECK (user_type IN ('freelancer', 'agency', 'enterprise')),
  ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- 2. Extend businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'flagged', 'approved', 'suspended'));

-- 3. Roadmap phases (admin-managed)
CREATE TABLE IF NOT EXISTS public.roadmap_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.roadmap_phases ENABLE ROW LEVEL SECURITY;

-- 4. Roadmap steps (admin-managed)
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.roadmap_phases(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  why text,
  how text[] DEFAULT '{}',
  mandatory boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  publish_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

-- 5. Audience tags
CREATE TABLE IF NOT EXISTS public.audience_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audience_tags ENABLE ROW LEVEL SECURITY;

-- 6. Step <-> tag mapping
CREATE TABLE IF NOT EXISTS public.roadmap_step_tags (
  step_id uuid NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.audience_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (step_id, tag_id)
);
ALTER TABLE public.roadmap_step_tags ENABLE ROW LEVEL SECURITY;

-- 7. Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 8. Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 9. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'free', 'pro', 'freelancer', 'agency', 'enterprise')),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 10. Notifications (per-user)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. Subscription plans (admin-managed)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  features text[] DEFAULT '{}',
  price_cents int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — admin full access
-- ============================================================

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles: admin full CRUD (extends existing policies)
CREATE POLICY "Admin full access profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Businesses: admin full CRUD
CREATE POLICY "Admin full access businesses"
  ON public.businesses FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Roadmap phases: admin only
CREATE POLICY "Admin manage roadmap_phases"
  ON public.roadmap_phases FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read published phases"
  ON public.roadmap_phases FOR SELECT TO authenticated
  USING (true);

-- Roadmap steps: admin manage, users read published
CREATE POLICY "Admin manage roadmap_steps"
  ON public.roadmap_steps FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read published steps"
  ON public.roadmap_steps FOR SELECT TO authenticated
  USING (status = 'published');

-- Audience tags
CREATE POLICY "Admin manage audience_tags"
  ON public.audience_tags FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read tags"
  ON public.audience_tags FOR SELECT TO authenticated
  USING (true);

-- Step tags
CREATE POLICY "Admin manage roadmap_step_tags"
  ON public.roadmap_step_tags FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read step_tags"
  ON public.roadmap_step_tags FOR SELECT TO authenticated
  USING (true);

-- Feature flags: admin manage, all read
CREATE POLICY "Admin manage feature_flags"
  ON public.feature_flags FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read feature_flags"
  ON public.feature_flags FOR SELECT TO authenticated
  USING (true);

-- Email templates: admin only
CREATE POLICY "Admin manage email_templates"
  ON public.email_templates FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Announcements: admin manage, users read published
CREATE POLICY "Admin manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read published announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (published = true);

-- Notifications: admin manage all, users read own
CREATE POLICY "Admin manage notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Subscription plans: admin manage, all read
CREATE POLICY "Admin manage subscription_plans"
  ON public.subscription_plans FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated read subscription_plans"
  ON public.subscription_plans FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- Seed default email templates
-- ============================================================
INSERT INTO public.email_templates (slug, subject, body) VALUES
  ('welcome', 'Welcome to Bizno!', 'Hi {{name}}, welcome to Bizno — your digital readiness OS. Let''s get you set up.'),
  ('reminder', 'Don''t forget your roadmap', 'Hi {{name}}, you have uncompleted tasks on your roadmap. Jump back in!'),
  ('notification', 'New update from Bizno', 'Hi {{name}}, {{message}}')
ON CONFLICT (slug) DO NOTHING;

-- Seed default feature flags
INSERT INTO public.feature_flags (key, label, enabled) VALUES
  ('wizard_mode', 'Wizard Mode', true),
  ('badges', 'Achievement Badges', true),
  ('affiliate_links', 'Affiliate Links', true),
  ('announcements', 'In-App Announcements', true)
ON CONFLICT (key) DO NOTHING;

-- Seed default subscription plans
INSERT INTO public.subscription_plans (name, features, price_cents, active) VALUES
  ('Free', ARRAY['1 business', 'Core checklist', 'Basic badges'], 0, true),
  ('Pro', ARRAY['Unlimited businesses', 'Full checklist', 'All badges', 'Priority support', 'Advanced playbooks'], 1900, true)
ON CONFLICT (name) DO NOTHING;

-- Seed default audience tags
INSERT INTO public.audience_tags (label) VALUES
  ('freelancer'), ('agency'), ('enterprise')
ON CONFLICT (label) DO NOTHING;

-- Grant service_role full access on new tables
GRANT ALL ON public.roadmap_phases TO service_role;
GRANT ALL ON public.roadmap_steps TO service_role;
GRANT ALL ON public.audience_tags TO service_role;
GRANT ALL ON public.roadmap_step_tags TO service_role;
GRANT ALL ON public.feature_flags TO service_role;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.announcements TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.subscription_plans TO service_role;

-- Grant authenticated basic access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_phases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audience_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_step_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
