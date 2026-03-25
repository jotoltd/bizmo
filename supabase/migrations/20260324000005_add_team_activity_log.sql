-- Team activity log table
CREATE TABLE IF NOT EXISTS business_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('member_invited', 'member_joined', 'member_removed', 'role_changed', 'ownership_transferred', 'invitation_cancelled', 'invitation_expired', 'invitation_resent')),
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_business_activity_log_business_id ON business_activity_log(business_id);
CREATE INDEX IF NOT EXISTS idx_business_activity_log_created_at ON business_activity_log(created_at DESC);

-- RLS policies
ALTER TABLE business_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners and members can view activity log"
  ON business_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_memberships
      WHERE business_memberships.business_id = business_activity_log.business_id
      AND business_memberships.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_activity_log.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Function to auto-log activity
CREATE OR REPLACE FUNCTION log_business_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO business_activity_log (business_id, user_id, action, target_user_id, metadata)
    VALUES (NEW.business_id, NEW.invited_by, 'member_invited', NEW.invited_user_id, jsonb_build_object('role', NEW.role, 'email', NEW.invited_email));
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO business_activity_log (business_id, user_id, action, target_user_id, metadata)
    VALUES (NEW.business_id, NEW.invited_user_id, 'member_joined', NEW.invited_user_id, jsonb_build_object('role', NEW.role));
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    INSERT INTO business_activity_log (business_id, user_id, action, target_user_id, metadata)
    VALUES (NEW.business_id, NEW.invited_user_id, 'invitation_cancelled', NEW.invited_user_id, jsonb_build_object('reason', 'rejected'));
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'cancelled' THEN
    INSERT INTO business_activity_log (business_id, user_id, action, target_user_id, metadata)
    VALUES (NEW.business_id, NEW.invited_by, 'invitation_cancelled', NEW.invited_user_id, jsonb_build_object('reason', 'cancelled_by_owner'));
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'expired' THEN
    INSERT INTO business_activity_log (business_id, user_id, action, target_user_id, metadata)
    VALUES (NEW.business_id, NEW.invited_by, 'invitation_expired', NEW.invited_user_id, jsonb_build_object('expired_at', NEW.expires_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for business invitations
DROP TRIGGER IF EXISTS business_invitations_activity_trigger ON business_invitations;
CREATE TRIGGER business_invitations_activity_trigger
  AFTER INSERT OR UPDATE ON business_invitations
  FOR EACH ROW
  EXECUTE FUNCTION log_business_activity();
