-- Email preferences table
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  invitation_emails boolean DEFAULT true,
  invitation_response_emails boolean DEFAULT true,
  activity_emails boolean DEFAULT true,
  announcement_emails boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_email_preferences_user_id ON user_email_preferences(user_id);

-- RLS policies
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own email preferences"
  ON user_email_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own email preferences"
  ON user_email_preferences
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own email preferences"
  ON user_email_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new users
DROP TRIGGER IF EXISTS create_email_preferences_trigger ON profiles;
CREATE TRIGGER create_email_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Backfill existing users
INSERT INTO user_email_preferences (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
