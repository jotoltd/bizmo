-- Fix invitation insert failures caused by activity log trigger under RLS.
-- The trigger writes to business_activity_log, which has RLS enabled and no insert policy.

CREATE OR REPLACE FUNCTION log_business_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
