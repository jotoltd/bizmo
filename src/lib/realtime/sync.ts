"use client";

import { useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseRealtimeSyncProps {
  businessId?: string;
  userId: string;
  onBusinessUpdate?: (business: unknown) => void;
  onTaskUpdate?: (task: unknown) => void;
  onTeamUpdate?: (member: unknown) => void;
  onNotification?: (notification: unknown) => void;
}

export function useRealtimeSync({
  businessId,
  userId,
  onBusinessUpdate,
  onTaskUpdate,
  onTeamUpdate,
  onNotification,
}: UseRealtimeSyncProps) {
  const supabase = createSupabaseBrowserClient();

  const subscribeToBusiness = useCallback(() => {
    if (!businessId) return;

    const channel = supabase
      .channel(`business:${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "businesses",
          filter: `id=eq.${businessId}`,
        },
        (payload) => {
          console.log("Business updated:", payload);
          onBusinessUpdate?.(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "business_tasks",
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log("Task updated:", payload);
          onTaskUpdate?.(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "business_members",
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log("Team member updated:", payload);
          onTeamUpdate?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, onBusinessUpdate, onTaskUpdate, onTeamUpdate]);

  const subscribeToUserNotifications = useCallback(() => {
    const channel = supabase
      .channel(`user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New notification:", payload);
          onNotification?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotification]);

  useEffect(() => {
    const unsubscribeBusiness = subscribeToBusiness();
    const unsubscribeNotifications = subscribeToUserNotifications();

    return () => {
      unsubscribeBusiness?.();
      unsubscribeNotifications?.();
    };
  }, [subscribeToBusiness, subscribeToUserNotifications]);
}
