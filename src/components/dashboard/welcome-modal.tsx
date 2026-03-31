"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, ArrowRight, Rocket, Shield, Users } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface WelcomeModalProps {
  userId: string;
  onComplete: () => void;
}

const slides = [
  {
    icon: Rocket,
    title: "Welcome to Bizno!",
    description: "Your all-in-one platform to start, manage, and grow your business in the UK.",
    color: "from-electric to-blue-500",
  },
  {
    icon: CheckCircle2,
    title: "Smart Checklists",
    description: "Follow step-by-step guides tailored to your business type. Never miss an important task.",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Shield,
    title: "Stay Compliant",
    description: "We help you navigate legal requirements, HMRC registrations, and company filings.",
    color: "from-purple-500 to-violet-400",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members, assign roles, and work together seamlessly.",
    color: "from-orange-500 to-amber-400",
  },
];

export function WelcomeModal({ userId, onComplete }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsExiting(true);
    await supabase
      .from("profiles")
      .update({ has_seen_welcome: true })
      .eq("id", userId);
    
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const progress = ((currentSlide + 1) / slides.length) * 100;

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
            className="relative w-full max-w-lg mx-4"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-electric/20 to-purple-500/20 rounded-3xl blur-xl" />
            
            <div className="relative rounded-2xl border border-white/10 bg-[var(--surface)] p-8 shadow-2xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-electric to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="relative">
                {/* Slide content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6"
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${slide.color} p-[1px]`}
                    >
                      <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {slide.title}
                      </h2>
                      <p className="text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                        {slide.description}
                      </p>
                    </div>

                    {/* Feature indicators */}
                    <div className="flex justify-center gap-2">
                      {slides.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? "w-8 bg-electric"
                              : index < currentSlide
                              ? "w-2 bg-green-500"
                              : "w-2 bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={handleComplete}
                    className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Skip intro
                  </button>
                  
                  <Button
                    onClick={handleNext}
                    className="group bg-electric text-black hover:bg-electric/90 font-semibold px-6"
                  >
                    {currentSlide === slides.length - 1 ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Let&apos;s Go!
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
