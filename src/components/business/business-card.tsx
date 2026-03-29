import Link from "next/link";
import type { Business } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BusinessCardProps = {
  business: Business;
  completion: {
    total: number;
    completed: number;
    ratio: number;
    percentage: number;
  };
};

export const BusinessCard = ({ business, completion }: BusinessCardProps) => (
  <div className="glass-panel p-6 space-y-5 relative card-hover animate-fade-up">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" size="sm">{business.type}</Badge>
          {completion.percentage === 100 && (
            <Badge variant="success" size="sm">Complete</Badge>
          )}
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] truncate">{business.name}</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Created {new Date(business.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-[var(--electric)]">{completion.percentage}%</span>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>Progress</span>
        <span>{completion.completed}/{completion.total} tasks</span>
      </div>
      <Progress value={completion.percentage} className="h-2" />
    </div>
    
    <div className="flex items-center justify-between pt-2">
      <Link
        href={`/business/${business.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--electric)] transition hover:text-[var(--electric-light)]"
      >
        Continue journey
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </Link>
    </div>
    
    <div
      className={cn(
        "absolute inset-0 pointer-events-none rounded-xl border transition-colors duration-300",
        completion.percentage === 100 
          ? "border-[var(--success)]/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]" 
          : "border-transparent"
      )}
    />
  </div>
);
