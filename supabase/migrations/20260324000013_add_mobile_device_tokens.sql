CREATE TABLE IF NOT EXISTS public.mobile_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('ios')),
  push_provider text NOT NULL DEFAULT 'apns' CHECK (push_provider IN ('apns')),
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mobile_device_tokens_user_id
  ON public.mobile_device_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_mobile_device_tokens_active
  ON public.mobile_device_tokens(is_active)
  WHERE is_active = true;

ALTER TABLE public.mobile_device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device tokens"
  ON public.mobile_device_tokens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own device tokens"
  ON public.mobile_device_tokens FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
  ON public.mobile_device_tokens FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
