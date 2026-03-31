export type PlanTier = "free" | "pro";
export type UserRole = "user" | "admin";
export type UserType = "freelancer" | "agency" | "enterprise";
export type BusinessStatus = "active" | "flagged" | "approved" | "suspended";
export type RoadmapStepStatus = "draft" | "published" | "scheduled";

export type Profile = {
  id: string;
  email: string;
  plan: PlanTier;
  role: UserRole;
  user_type: UserType;
  last_active: string;
  suspended: boolean;
  avatar_url: string | null;
  full_name: string | null;
};

export type Business = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  completed_tasks: string[];
  view_preference: "checklist" | "wizard";
  status: BusinessStatus;
  created_at: string;
  logo_url: string | null;
};

export type BusinessMembershipRole = "owner" | "admin" | "member";

export type BusinessMembership = {
  id: string;
  business_id: string;
  user_id: string;
  role: BusinessMembershipRole;
  invited_by: string | null;
  created_at: string;
};

export type BusinessTeamMember = {
  user_id: string;
  email: string;
  role: BusinessMembershipRole;
  created_at: string;
};

export type BusinessInvitationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type BusinessInvitation = {
  id: string;
  business_id: string;
  invited_user_id: string;
  invited_email: string;
  invited_by: string;
  invited_by_email?: string;
  role: BusinessMembershipRole;
  status: BusinessInvitationStatus;
  responded_at: string | null;
  created_at: string;
  business_name?: string;
};

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type RoadmapStep = {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  why: string | null;
  how: string[];
  affiliate_link: string | null;
  affiliate_name: string | null;
  mandatory: boolean;
  status: RoadmapStepStatus;
  publish_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Comprehensive guidance fields
  time_estimate: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  prerequisites: string[] | null;
  resources: { name: string; url: string }[] | null;
  common_pitfalls: string[] | null;
  success_criteria: string | null;
};

export type AudienceTag = {
  id: string;
  label: string;
  created_at: string;
};

export type FeatureFlag = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  created_at: string;
};

export type EmailTemplate = {
  id: string;
  slug: string;
  subject: string;
  body: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  published: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export type BusinessActivityLog = {
  id: string;
  business_id: string;
  user_id: string | null;
  action: 'member_invited' | 'member_joined' | 'member_removed' | 'role_changed' | 'ownership_transferred' | 'invitation_cancelled' | 'invitation_expired' | 'invitation_resent';
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type UserNotification = {
  id: string;
  user_id: string;
  type:
    | 'invitation_received'
    | 'invitation_accepted'
    | 'invitation_rejected'
    | 'invitation_expired'
    | 'member_removed'
    | 'role_changed'
    | 'ownership_transferred'
    | 'announcement'
    | 'system_alert'
    | 'business_update'
    | 'deadline_approaching'
    | 'deadline_missed'
    | 'task_completed'
    | 'task_assigned';
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  read_at: string | null;
  created_at: string;
};

export type UserEmailPreferences = {
  user_id: string;
  invitation_emails: boolean;
  invitation_response_emails: boolean;
  activity_emails: boolean;
  announcement_emails: boolean;
  updated_at: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  features: string[];
  price_cents: number;
  active: boolean;
  created_at: string;
};
