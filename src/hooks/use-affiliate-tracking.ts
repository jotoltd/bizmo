"use client";

import { useCallback } from "react";
import { trackAffiliateClickAction } from "@/lib/affiliate/actions";

export function useAffiliateTracking(businessId: string) {
  const trackClick = useCallback(
    async (stepId: string, affiliateUrl: string, affiliateName?: string | null) => {
      try {
        await trackAffiliateClickAction({
          stepId,
          affiliateUrl,
          affiliateName: affiliateName || undefined,
          businessId,
        });
      } catch (error) {
        console.error("Failed to track affiliate click", error);
      }
    },
    [businessId]
  );

  return { trackClick };
}
