export type PlanTier = "free" | "pro";

export type Profile = {
  id: string;
  email: string;
  plan: PlanTier;
};

export type Business = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  completed_tasks: string[];
  view_preference: "checklist" | "wizard";
  created_at: string;
};
