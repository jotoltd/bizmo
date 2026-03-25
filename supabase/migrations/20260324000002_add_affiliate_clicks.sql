-- Create affiliate clicks tracking table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  affiliate_name TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ
);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_business ON affiliate_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_step ON affiliate_clicks(step_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);

-- Enable RLS
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own clicks
CREATE POLICY "Users view own clicks" ON affiliate_clicks
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all clicks
CREATE POLICY "Admins view all clicks" ON affiliate_clicks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
