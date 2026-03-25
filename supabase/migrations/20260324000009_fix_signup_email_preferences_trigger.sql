-- Fix signup failure by allowing profile-triggered email preference inserts
-- Trigger context may not satisfy auth.uid() RLS checks during auth signup flows.

CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
