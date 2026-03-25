-- Add expires_at column to business_invitations
ALTER TABLE business_invitations ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Update existing invitations to expire 7 days from creation
UPDATE business_invitations 
SET expires_at = created_at + interval '7 days'
WHERE expires_at IS NULL;

-- Set default for future invitations
ALTER TABLE business_invitations ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');

-- Extend status check constraint to allow 'expired'
ALTER TABLE business_invitations
  DROP CONSTRAINT IF EXISTS business_invitations_status_check;

ALTER TABLE business_invitations
  ADD CONSTRAINT business_invitations_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired'));

-- Create function to auto-expire invitations
create or replace function expire_old_invitations()
returns void as $$
begin
  update business_invitations
  set status = 'expired'
  where status = 'pending'
  and expires_at < now();
end;
$$ language plpgsql;

-- Create index for faster expiry queries
create index if not exists idx_business_invitations_expires_at 
on business_invitations(expires_at) 
where status = 'pending';
