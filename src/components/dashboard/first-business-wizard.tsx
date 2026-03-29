"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface FirstBusinessWizardProps {
  userId: string;
  onComplete: () => void;
}

const BUSINESS_TYPES = [
  { id: "limited_company", label: "Limited Company", icon: "🏢" },
  { id: "sole_trader", label: "Sole Trader", icon: "👤" },
  { id: "partnership", label: "Partnership", icon: "🤝" },
  { id: "llp", label: "Limited Liability Partnership", icon: "📊" },
  { id: "freelancer", label: "Freelancer / Contractor", icon: "💻" },
  { id: "startup", label: "Startup", icon: "🚀" },
];

export function FirstBusinessWizard({ userId, onComplete }: FirstBusinessWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const createBusiness = async () => {
    if (!businessName || !businessType) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        name: businessName,
        type: businessType,
        owner_id: userId,
      })
      .select()
      .single();

    setLoading(false);
    
    if (data) {
      onComplete();
      router.push(`/business/${data.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--surface)] p-8 shadow-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-2">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div 
              className="h-2 rounded-full bg-electric transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-electric/20 flex items-center justify-center text-3xl mb-4">
                🏢
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                What&apos;s your business name?
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                This is how we&apos;ll refer to your business throughout the platform.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Acme Innovations Ltd"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-electric focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!businessName}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-electric/20 flex items-center justify-center text-3xl mb-4">
                📝
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                What type of business is this?
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                This helps us customize your setup checklist.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setBusinessType(type.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    businessType === type.id
                      ? "border-electric bg-electric/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{type.label}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!businessType}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-3xl mb-4">
              ✅
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Ready to create your business?
            </h2>
            <div className="bg-white/5 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">Name:</span>{" "}
                <span className="text-[var(--text-primary)] font-medium">{businessName}</span>
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">Type:</span>{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {BUSINESS_TYPES.find(t => t.id === businessType)?.label}
                </span>
              </p>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              We&apos;ll set up your personalized checklist based on your business type.
            </p>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={createBusiness}
                disabled={loading}
                className="bg-green-600 hover:bg-green-500"
              >
                {loading ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
