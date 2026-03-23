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
};

export type BusinessMembershipRole = "owner" | "member";

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

export type SubscriptionPlan = {
  id: string;
  name: string;
  features: string[];
  price_cents: number;
  active: boolean;
  created_at: string;
};
