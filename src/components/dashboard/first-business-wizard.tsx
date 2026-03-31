"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Building2, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBusinessAction } from "@/app/dashboard/actions";

interface FirstBusinessWizardProps {
  onComplete: () => void;
}

const BUSINESS_TYPES = [
  { id: "limited_company", label: "Limited Company", icon: "🏢", description: "Most popular for small businesses" },
  { id: "sole_trader", label: "Sole Trader", icon: "👤", description: "Simplest structure, just you" },
  { id: "partnership", label: "Partnership", icon: "🤝", description: "Two or more people" },
  { id: "llp", label: "Limited Liability Partnership", icon: "📊", description: "Protected partnership" },
  { id: "freelancer", label: "Freelancer / Contractor", icon: "💻", description: "Independent professional" },
  { id: "startup", label: "Startup", icon: "🚀", description: "High-growth potential" },
  { id: "social_enterprise", label: "Social Enterprise", icon: "🌍", description: "Impact-driven business" },
  { id: "charity", label: "Charity", icon: "❤️", description: "Non-profit organization" },
  { id: "franchise", label: "Franchise", icon: "🏪", description: "Licensed business model" },
  { id: "cooperative", label: "Cooperative", icon: "🤲", description: "Member-owned business" },
];

export function FirstBusinessWizard({ onComplete }: FirstBusinessWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const createBusiness = async () => {
    if (!businessName || !businessType) return;
    
    setLoading(true);
    const result = await createBusinessAction({
      name: businessName,
      type: businessType,
    });
    setLoading(false);

    if (result?.success && result.businessId) {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
        router.push(`/business/${result.businessId}?onboarding=1`);
      }, 300);
    }
  };

  const progress = (step / 3) * 100;

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl mx-4"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-electric/20 to-green-500/20 rounded-3xl blur-xl" />
            
            <div className="relative rounded-2xl border border-white/10 bg-[var(--surface)] p-8 shadow-2xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-electric to-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-electric/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-electric" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Create Business</span>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">Step {step} of 3</span>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-electric to-blue-500 p-[1px]"
                      >
                        <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm text-2xl">
                          🏢
                        </div>
                      </motion.div>
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        What&apos;s your business name?
                      </h2>
                      <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                        Choose a name that represents your brand. You can always change this later.
                      </p>
                    </div>

                    <div className="space-y-3 max-w-md mx-auto">
                      <label className="text-sm font-medium text-[var(--text-secondary)]">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., Acme Innovations Ltd"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all text-lg"
                        autoFocus
                      />
                      <p className="text-xs text-[var(--text-tertiary)]">
                        This is how we&apos;ll refer to your business throughout the platform.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => setStep(2)} 
                        disabled={!businessName.trim()}
                        className="group bg-electric text-black hover:bg-electric/90 font-semibold px-6"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-400 p-[1px]"
                      >
                        <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm text-2xl">
                          📝
                        </div>
                      </motion.div>
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        What type of business?
                      </h2>
                      <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                        Select the structure that best describes your business. This helps us customize your checklist.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {BUSINESS_TYPES.map((type, index) => (
                        <motion.button
                          key={type.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setBusinessType(type.id)}
                          className={`p-4 rounded-xl border text-left transition-all relative group ${
                            businessType === type.id
                              ? "border-electric bg-electric/10 ring-2 ring-electric/30"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                                {type.label}
                              </p>
                              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-tight">
                                {type.description}
                              </p>
                            </div>
                          </div>
                          {businessType === type.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-electric" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        disabled={!businessType}
                        className="group bg-electric text-black hover:bg-electric/90 font-semibold px-6"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 p-[1px]"
                      >
                        <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="w-8 h-8 text-green-400" />
                        </div>
                      </motion.div>
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        Ready to launch?
                      </h2>
                      <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                        Let&apos;s create your business and set up your personalized checklist.
                      </p>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4 max-w-md mx-auto"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-electric/20 flex items-center justify-center text-lg">
                          🏢
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">Business Name</p>
                          <p className="text-[var(--text-primary)] font-semibold">{businessName}</p>
                        </div>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">
                          {BUSINESS_TYPES.find(t => t.id === businessType)?.icon}
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">Business Type</p>
                          <p className="text-[var(--text-primary)] font-semibold">
                            {BUSINESS_TYPES.find(t => t.id === businessType)?.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-between pt-4"
                    >
                      <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button 
                        onClick={createBusiness}
                        disabled={loading}
                        className="group bg-green-600 hover:bg-green-500 text-white font-semibold px-6"
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Business
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
