"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface WelcomeModalProps {
  userId: string;
  onComplete: () => void;
}

export function WelcomeModal({ userId, onComplete }: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const supabase = createSupabaseBrowserClient();

  const markWelcomeSeen = async () => {
    await supabase
      .from("profiles")
      .update({ has_seen_welcome: true })
      .eq("id", userId);
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--surface)] p-8 shadow-2xl">
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-electric to-electric/50 flex items-center justify-center text-4xl">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Welcome to Bizno!
              </h2>
              <p className="text-[var(--text-secondary)]">
                Your digital readiness companion. Let&apos;s get your first business set up in under 2 minutes.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-electric" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-electric/20 flex items-center justify-center text-3xl mb-4">
                🎯
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                What is Bizno?
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                Bizno helps you track your business setup progress, manage deadlines, and stay organized from day one.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Smart Checklists</p>
                  <p className="text-sm text-[var(--text-secondary)]">Know exactly what to do and when</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Deadline Tracking</p>
                  <p className="text-sm text-[var(--text-secondary)]">Never miss important dates</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Mobile Ready</p>
                  <p className="text-sm text-[var(--text-secondary)]">Access your business anywhere</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-3xl">
              🚀
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Ready to Launch?
              </h2>
              <p className="text-[var(--text-secondary)]">
                Let&apos;s create your first business. This takes just 30 seconds.
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={markWelcomeSeen} className="bg-green-600 hover:bg-green-500">
                Create First Business
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
