-- Seed sample roadmap data with affiliate links for testing and demonstration
-- This gives admin users examples to edit and work with

-- Sample Phases
INSERT INTO roadmap_phases (title, description, sort_order, created_at, updated_at)
VALUES 
  ('Foundation', 'Set up the essential building blocks of your business', 1, NOW(), NOW()),
  ('Branding', 'Create your brand identity and visual assets', 2, NOW(), NOW()),
  ('Digital Presence', 'Build your website and social media presence', 3, NOW(), NOW()),
  ('Launch', 'Prepare and execute your business launch', 4, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample Steps with Affiliate Links
INSERT INTO roadmap_steps (
  phase_id, 
  title, 
  description, 
  why, 
  how, 
  affiliate_link, 
  affiliate_name,
  mandatory, 
  status, 
  sort_order,
  created_at, 
  updated_at
)
SELECT 
  p.id,
  step.title,
  step.description,
  step.why,
  step.how,
  step.affiliate_link,
  step.affiliate_name,
  step.mandatory,
  'published',
  step.sort_order,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Foundation', 'Register your business', 'File your company with Companies House or relevant authority', 'Legal protection and credibility', ARRAY['Choose business structure', 'Register with Companies House', 'Get your UTR number', 'Open business bank account'], null, null, true, 1),
    ('Foundation', 'Get business insurance', 'Protect your business with essential coverage', 'Mitigate risk and meet client requirements', ARRAY['Assess your risks', 'Compare quotes', 'Purchase liability insurance'], 'https://www.superscript.com/business-insurance', 'Get £20 off with Superscript', false, 2),
    ('Foundation', 'Set up accounting', 'Choose an accounting system to track finances', 'Stay compliant and understand your numbers', ARRAY['Choose accounting software', 'Connect your bank', 'Set up tax reminders'], 'https://quickbooks.intuit.com/uk/', 'Try QuickBooks free for 30 days', true, 3),
    ('Branding', 'Design your logo', 'Create a memorable visual identity', 'First impressions matter for brand recognition', ARRAY['Define your brand colors', 'Sketch concepts', 'Use design tools or hire designer'], 'https://www.canva.com/', 'Design free with Canva Pro', false, 1),
    ('Branding', 'Buy domain name', 'Secure your online identity', 'Control your digital presence and look professional', ARRAY['Brainstorm domain names', 'Check availability', 'Purchase and set up DNS'], 'https://www.namecheap.com/', 'Domains from £0.99 at Namecheap', true, 2),
    ('Branding', 'Create brand guidelines', 'Document your visual and tone standards', 'Ensure consistency across all touchpoints', ARRAY['Define color palette', 'Choose fonts', 'Write tone of voice guide'], null, null, false, 3),
    ('Digital Presence', 'Build your website', 'Create your digital storefront', 'Your 24/7 salesperson and credibility builder', ARRAY['Choose platform', 'Design pages', 'Add content', 'Test and launch'], 'https://www.shopify.com/', 'Start free trial with Shopify', true, 1),
    ('Digital Presence', 'Set up email', 'Professional email with your domain', 'Build trust with branded communication', ARRAY['Choose email provider', 'Configure MX records', 'Set up signatures'], 'https://workspace.google.com/', 'Get 20% off Google Workspace', true, 2),
    ('Digital Presence', 'Create social accounts', 'Establish presence on key platforms', 'Meet customers where they spend time', ARRAY['Choose 2-3 platforms', 'Create profiles', 'Design cover images'], null, null, false, 3),
    ('Launch', 'Plan launch campaign', 'Build buzz for your opening', 'Maximize impact and early traction', ARRAY['Set launch date', 'Create teaser content', 'Build email list', 'Plan launch event'], null, null, true, 1),
    ('Launch', 'Soft launch to friends', 'Test with your inner circle first', 'Get feedback and fix issues before public launch', ARRAY['Invite 10-20 people', 'Gather feedback', 'Fix bugs', 'Request testimonials'], null, null, false, 2),
    ('Launch', 'Official launch!', 'Open your doors to the world', 'Celebrate your hard work and start serving customers', ARRAY['Post on social media', 'Send launch email', 'Update website', 'Monitor and respond'], null, null, true, 3)
) AS step(phase_title, title, description, why, how, affiliate_link, affiliate_name, mandatory, sort_order)
CROSS JOIN LATERAL (
  SELECT id FROM roadmap_phases WHERE title = step.phase_title LIMIT 1
) AS p(id)
ON CONFLICT DO NOTHING;

-- Sample Audience Tags
INSERT INTO audience_tags (label, created_at)
VALUES 
  ('freelancer', NOW()),
  ('agency', NOW()),
  ('enterprise', NOW()),
  ('startup', NOW()),
  ('ecommerce', NOW())
ON CONFLICT DO NOTHING;

-- Sample Feature Flags
INSERT INTO feature_flags (key, label, enabled, created_at)
VALUES 
  ('show_affiliate_links', 'Show Affiliate Links', true, NOW()),
  ('enable_team_collaboration', 'Team Collaboration', true, NOW()),
  ('enable_progress_analytics', 'Progress Analytics', true, NOW()),
  ('show_sample_data', 'Show Sample Data', true, NOW())
ON CONFLICT DO NOTHING;

-- Sample Email Templates
INSERT INTO email_templates (slug, subject, body, updated_at)
VALUES 
  ('welcome', 'Welcome to Bizno! 🚀', 'Hi there!

Welcome to Bizno - your business launch companion. We''re excited to help you turn your idea into reality.

Your first step: Add your business and start your roadmap.

Need help? Just reply to this email.

Cheers,
The Bizno Team', NOW()),
  ('task_reminder', 'Keep the momentum going! 📋', 'Hi!

You''ve got tasks waiting on your roadmap. Small steps every day lead to big results.

Log in to see what''s next.

Keep building!
The Bizno Team', NOW())
ON CONFLICT DO NOTHING;

-- Sample Subscription Plan (Free Forever)
INSERT INTO subscription_plans (name, features, price_cents, active, created_at)
VALUES 
  ('Free Forever', ARRAY['Unlimited businesses', 'Full roadmap access', 'All checklist features', 'Team collaboration', 'Affiliate discounts', 'Priority support'], 0, true, NOW())
ON CONFLICT DO NOTHING;
