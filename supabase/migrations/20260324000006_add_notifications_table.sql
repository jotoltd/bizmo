-- Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('invitation_received', 'invitation_accepted', 'invitation_rejected', 'invitation_expired', 'member_removed', 'role_changed', 'ownership_transferred', 'announcement')),
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- RLS policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own notifications"
  ON user_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own notifications"
  ON user_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON user_notifications
  FOR INSERT
  WITH CHECK (true);

-- Function to create notification when invitation is received
CREATE OR REPLACE FUNCTION create_invitation_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notifications (user_id, type, title, body, data)
  VALUES (
    NEW.invited_user_id,
    'invitation_received',
    'Business Invitation',
    'You have been invited to join a business',
    jsonb_build_object('invitation_id', NEW.id, 'business_id', NEW.business_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invitation notifications
DROP TRIGGER IF EXISTS invitation_notification_trigger ON business_invitations;
CREATE TRIGGER invitation_notification_trigger
  AFTER INSERT ON business_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_invitation_notification();

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_notifications
  SET read = true, read_at = now()
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql;
