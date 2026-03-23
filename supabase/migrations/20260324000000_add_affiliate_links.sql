-- Add affiliate links to roadmap steps
ALTER TABLE IF EXISTS roadmap_steps
ADD COLUMN IF NOT EXISTS affiliate_link TEXT,
ADD COLUMN IF NOT EXISTS affiliate_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN roadmap_steps.affiliate_link IS 'Affiliate/referral URL for the step';
COMMENT ON COLUMN roadmap_steps.affiliate_name IS 'Display name for the affiliate link (e.g., "Get 20% off with Shopify")';
