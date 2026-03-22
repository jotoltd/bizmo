"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BUSINESS_TYPES } from "@/data/business-types";
import { createBusinessAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AddBusinessDialog = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [onboardingPath, setOnboardingPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const defaultType = useMemo(() => BUSINESS_TYPES[0], []);

  const handleSubmit = (formData: FormData) => {
    const name = String(formData.get("name") ?? "");
    const type = String(formData.get("type") ?? defaultType);

    startTransition(async () => {
      setError(null);
      const result = await createBusinessAction({ name, type });
      if (result?.error) {
        setSuccess(false);
        setOnboardingPath(null);
        setError(result.error);
        return;
      }
      setSuccess(true);
      setOnboardingPath(result?.onboardingPath ?? null);
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="h-12 px-6 text-base"
      >
        + Add business
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-panel max-w-lg w-full p-8 space-y-8 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-electric">
                Add business
              </p>
              <h2 className="text-3xl font-semibold">What are we building?</h2>
              <p className="text-sm text-slate-400">
                Bizno will tailor your readiness roadmap based on the industry
                you select.
              </p>
            </div>
            <form
              className="space-y-6"
              action={(formData) => handleSubmit(formData)}
            >
              <label className="space-y-2 block text-sm">
                <span className="text-slate-300">Business name</span>
                <input
                  name="name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
                  placeholder="eg. Northwind Studio"
                />
              </label>
              <label className="space-y-2 block text-sm">
                <span className="text-slate-300">Business type</span>
                <select
                  name="type"
                  defaultValue={defaultType}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-electric focus:outline-none"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#090e1c]">
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  <p>Business created. Let&apos;s get onboarding started.</p>
                  {onboardingPath && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.push(onboardingPath);
                        router.refresh();
                      }}
                      className="mt-2 text-emerald-200 underline underline-offset-4 hover:text-white"
                    >
                      Open business onboarding →
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Adding..." : "Save business"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "border border-white/10 flex-1",
                    isPending && "opacity-50"
                  )}
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
