ALTER TABLE public.user_notifications
  DROP CONSTRAINT IF EXISTS user_notifications_type_check;

ALTER TABLE public.user_notifications
  ADD CONSTRAINT user_notifications_type_check
  CHECK (
    type IN (
      'invitation_received',
      'invitation_accepted',
      'invitation_rejected',
      'invitation_expired',
      'member_removed',
      'role_changed',
      'ownership_transferred',
      'announcement',
      'system_alert',
      'business_update',
      'deadline_approaching',
      'deadline_missed',
      'task_completed',
      'task_assigned'
    )
  );
