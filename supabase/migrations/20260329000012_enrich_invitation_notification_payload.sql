CREATE OR REPLACE FUNCTION create_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
  inviter_email text;
  business_name text;
BEGIN
  SELECT p.email
  INTO inviter_email
  FROM profiles p
  WHERE p.id = NEW.invited_by;

  SELECT b.name
  INTO business_name
  FROM businesses b
  WHERE b.id = NEW.business_id;

  INSERT INTO user_notifications (user_id, type, title, body, data)
  VALUES (
    NEW.invited_user_id,
    'invitation_received',
    'Business invitation',
    CASE
      WHEN inviter_email IS NOT NULL AND business_name IS NOT NULL THEN
        inviter_email || ' invited you to join ' || business_name || '.'
      WHEN inviter_email IS NOT NULL THEN
        inviter_email || ' invited you to join a business.'
      WHEN business_name IS NOT NULL THEN
        'You were invited to join ' || business_name || '.'
      ELSE
        'You were invited to join a business.'
    END,
    jsonb_build_object(
      'invitation_id', NEW.id,
      'business_id', NEW.business_id,
      'business_name', business_name,
      'inviter_email', inviter_email
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
