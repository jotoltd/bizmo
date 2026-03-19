import type { PlanTier } from "@/types";
import { cn } from "@/lib/utils";

export const PlanBadge = ({ plan }: { plan: PlanTier }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
      plan === "pro"
        ? "bg-electric/20 text-electric border border-electric/60"
        : "bg-white/5 text-slate-300"
    )}
  >
    {plan === "pro" ? "Pro" : "Free"} Plan
  </span>
);
