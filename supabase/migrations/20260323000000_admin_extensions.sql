-- ============================================================
-- Admin Audit Logs - Track all admin actions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_email text NOT NULL,
  action text NOT NULL, -- 'create_user', 'delete_user', 'update_business', etc.
  target_type text NOT NULL, -- 'user', 'business', 'announcement', etc.
  target_id uuid,
  target_email text, -- for user-related actions
  details jsonb DEFAULT '{}', -- additional context
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert audit logs (via trigger or app)
CREATE POLICY "Admins can create audit logs" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_id ON public.admin_audit_logs(target_id);

-- ============================================================
-- Login History - Track user authentication events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_reset', 'token_refresh')),
  ip_address text,
  user_agent text,
  location text, -- geo-location if available
  success boolean NOT NULL DEFAULT true,
  failure_reason text, -- for failed logins
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Users can see their own login history
CREATE POLICY "Users can view own login history" ON public.login_history
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all login history
CREATE POLICY "Admins can view all login history" ON public.login_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert via app only
CREATE POLICY "App can insert login history" ON public.login_history
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_event_type ON public.login_history(event_type);

-- ============================================================
-- Support Tickets - User support system
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'feature_request', 'bug_report', 'account')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view and manage all tickets
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);

-- ============================================================
-- Support Ticket Replies
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  internal_note boolean NOT NULL DEFAULT false, -- for staff-only notes
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- Users can view non-internal replies on their tickets
CREATE POLICY "Users can view ticket replies" ON public.support_ticket_replies
  FOR SELECT USING (
    internal_note = false AND
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Users can reply to their own tickets
CREATE POLICY "Users can reply to own tickets" ON public.support_ticket_replies
  FOR INSERT WITH CHECK (
    is_staff = false AND
    internal_note = false AND
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage ticket replies" ON public.support_ticket_replies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON public.support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_created_at ON public.support_ticket_replies(created_at);

-- ============================================================
-- System Health Metrics
-- ============================================================

CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system metrics" ON public.system_health_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can insert metrics" ON public.system_health_metrics
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_system_health_metrics_name ON public.system_health_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_created_at ON public.system_health_metrics(created_at DESC);

-- ============================================================
-- Rate Limiting Config
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_pattern text NOT NULL UNIQUE, -- e.g., '/api/auth/*', '/api/businesses'
  requests_per_minute integer NOT NULL DEFAULT 60,
  requests_per_hour integer NOT NULL DEFAULT 1000,
  burst_limit integer NOT NULL DEFAULT 10,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rate limits" ON public.rate_limit_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default configs
INSERT INTO public.rate_limit_config (endpoint_pattern, requests_per_minute, requests_per_hour, burst_limit)
VALUES
  ('/api/auth/*', 30, 300, 5),
  ('/api/admin/*', 120, 2000, 20),
  ('/api/businesses', 60, 1000, 10),
  ('/api/users', 60, 1000, 10)
ON CONFLICT (endpoint_pattern) DO NOTHING;

-- ============================================================
-- Email Campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  audience text NOT NULL DEFAULT 'all', -- 'all', 'free', 'pro', 'freelancer', 'agency', 'enterprise', 'custom'
  custom_filters jsonb DEFAULT '{}', -- for complex audience targeting
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);

-- ============================================================
-- Helper Functions
-- ============================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id uuid,
  p_admin_email text,
  p_action text,
  p_target_type text,
  p_target_id uuid DEFAULT NULL,
  p_target_email text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_id, admin_email, action, target_type, target_id, target_email, details
  ) VALUES (
    p_admin_id, p_admin_email, p_action, p_target_type, p_target_id, p_target_email, p_details
  );
END;
$$;

-- Function to update support ticket timestamp
CREATE OR REPLACE FUNCTION public.update_ticket_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.support_tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_reply_timestamp ON public.support_ticket_replies;
CREATE TRIGGER ticket_reply_timestamp
  AFTER INSERT ON public.support_ticket_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_timestamp();

-- Grant permissions
GRANT ALL ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.login_history TO authenticated;
GRANT ALL ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_ticket_replies TO authenticated;
GRANT ALL ON public.system_health_metrics TO authenticated;
GRANT ALL ON public.rate_limit_config TO authenticated;
GRANT ALL ON public.email_campaigns TO authenticated;
