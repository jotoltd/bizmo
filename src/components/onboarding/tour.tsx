"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TOUR_STEPS = [
  {
    target: "[data-tour='view-toggle']",
    title: "Choose your view",
    content: "Switch between checklist view for quick scanning or wizard view for focused step-by-step progress.",
  },
  {
    target: "[data-tour='progress']",
    title: "Track your progress",
    content: "Watch your business launch come to life with real-time progress tracking across all phases.",
  },
  {
    target: "[data-tour='affiliate']",
    title: "Save on tools",
    content: "Look for the 💰 Deal badge to get exclusive discounts on tools you'll need anyway.",
  },
  {
    target: "[data-tour='team']",
    title: "Invite your team",
    content: "Add co-founders, partners, or advisors to keep everyone aligned on the roadmap.",
  },
];

export function OnboardingTour({ businessId, onComplete }: { businessId: string; onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !localStorage.getItem(`tour-${businessId}`);
  });
  const [completed, setCompleted] = useState(false);

  if (!show || completed) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
      localStorage.setItem(`tour-${businessId}`, "true");
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setCompleted(true);
    localStorage.setItem(`tour-${businessId}`, "true");
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-electric">Quick tour</p>
          <button onClick={handleSkip} className="text-xs text-slate-500 hover:text-slate-300">
            Skip
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
          <p className="text-sm text-slate-400">{step.content}</p>
        </div>

        <div className="flex items-center gap-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === currentStep ? "bg-electric" : "bg-white/20"
              )}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleNext}
            className="flex-1 rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            {isLast ? "Get started" : "Next"}
          </button>
          {!isLast && (
            <button
              onClick={handleSkip}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:text-white"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
