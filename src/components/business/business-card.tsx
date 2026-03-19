import Link from "next/link";
import type { Business, PlanTier } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn, percent } from "@/lib/utils";

export type BusinessCardProps = {
  business: Business;
  completion: {
    total: number;
    completed: number;
    ratio: number;
    percentage: number;
  };
  plan: PlanTier;
};

export const BusinessCard = ({ business, completion, plan }: BusinessCardProps) => (
  <div className="glass-panel p-6 space-y-6 relative">
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{business.type}</span>
        <span>{new Date(business.created_at).toLocaleDateString()}</span>
      </div>
      <h3 className="text-2xl font-semibold">{business.name}</h3>
      <p className="text-sm text-slate-400">
        Your business is <span className="text-white">{completion.percentage}%</span> digital-ready.
      </p>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>Progress</span>
        <span>{completion.completed}/{completion.total} tasks</span>
      </div>
      <Progress value={completion.percentage} />
    </div>
    <div className="flex items-center justify-between">
      <Link
        href={`/business/${business.id}`}
        className="inline-flex items-center gap-2 text-electric font-semibold"
      >
        Continue ↗
      </Link>
      {plan === "free" && (
        <span className="text-xs text-slate-500">
          Upgrade for badges & advanced playbooks
        </span>
      )}
    </div>
    <div
      className={cn(
        "absolute inset-0 pointer-events-none rounded-2xl border border-white/5",
        completion.percentage === 100 && "border-electric/50"
      )}
    />
  </div>
);
