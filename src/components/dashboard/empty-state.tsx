"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  type: "businesses" | "tasks" | "team" | "notifications";
  onAction?: () => void;
}

export function DashboardEmptyState({ type, onAction }: EmptyStateProps) {
  const router = useRouter();

  const states = {
    businesses: {
      icon: "🏢",
      title: "No businesses yet",
      description: "Create your first business to get started with your personalized setup checklist.",
      action: onAction || (() => router.push("/dashboard?create=business")),
      actionLabel: "Create Your First Business",
    },
    tasks: {
      icon: "📋",
      title: "No active tasks",
      description: "Select a business to view your personalized setup checklist and track your progress.",
      action: () => router.push("/dashboard"),
      actionLabel: "View My Businesses",
    },
    team: {
      icon: "👥",
      title: "No team members",
      description: "Invite team members to collaborate on your business setup.",
      action: onAction,
      actionLabel: "Invite Team Members",
    },
    notifications: {
      icon: "🔔",
      title: "No notifications",
      description: "You're all caught up! We'll notify you about important deadlines and updates.",
      action: undefined,
      actionLabel: undefined,
    },
  };

  const state = states[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl mb-6">
        {state.icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        {state.title}
      </h3>
      <p className="text-[var(--text-secondary)] max-w-md mb-6">
        {state.description}
      </p>
      {state.action && state.actionLabel && (
        <Button onClick={state.action}>
          {state.actionLabel}
        </Button>
      )}
    </div>
  );
}
