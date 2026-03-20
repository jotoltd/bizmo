"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { envClient } from "@/lib/env-client";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/app/login/actions";

type AuthMode = "sign-in" | "sign-up" | "reset";

export const AuthPanel = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      setMessage(null);

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${envClient.siteUrl}/auth/callback`,
        });
        if (error) {
          setMessage({ type: "error", text: error.message });
          return;
        }
        setMessage({
          type: "success",
          text: `Password reset instructions sent to ${email}.`,
        });
        return;
      }

      if (mode === "sign-up") {
        const result = await signUpAction({ email, password });

        if (result?.error) {
          setMessage({ type: "error", text: result.error });
          return;
        }

        setMessage({ type: "success", text: "Account created. Redirecting..." });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({ type: "success", text: "Welcome back. Redirecting..." });
      router.push("/dashboard");
      router.refresh();
    });
  };

  const heading =
    mode === "sign-in"
      ? "Digital readiness begins here"
      : mode === "sign-up"
        ? "Create your Bizno account"
        : "Reset your password";

  const cta = mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Send reset link";

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass-panel max-w-md w-full p-10 space-y-8">
        <div className="space-y-3 text-center">
          <p className="uppercase text-xs tracking-[0.4em] text-electric">Welcome to Bizno</p>
          <h1 className="text-3xl font-semibold">{heading}</h1>
          <p className="text-sm text-slate-400">
            Launch an account, add your business, and follow a curated roadmap that keeps every digital asset on
            track.
          </p>
        </div>

        {message && (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === "error"
                ? "border border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-2 block text-sm">
            <span className="text-slate-300">Work email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
            />
          </label>
          {mode !== "reset" && (
            <label className="space-y-2 block text-sm">
              <span className="text-slate-300">Password</span>
              <input
                name="password"
                type="password"
                minLength={6}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
              />
            </label>
          )}

          <Button type="submit" disabled={isPending} className="w-full h-12 text-base">
            {isPending ? "Working..." : cta}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400 space-y-1">
          {mode === "sign-in" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setMode("sign-up");
                }}
                className="text-electric hover:text-white"
              >
                New here? Create an account →
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setMode("reset");
                }}
                className="block text-electric hover:text-white"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === "sign-up" && (
            <button
              type="button"
              onClick={() => {
                setMessage(null);
                setMode("sign-in");
              }}
              className="text-electric hover:text-white"
            >
              Already have an account? Sign in →
            </button>
          )}
          {mode === "reset" && (
            <button
              type="button"
              onClick={() => {
                setMessage(null);
                setMode("sign-in");
              }}
              className="text-electric hover:text-white"
            >
              Remembered it? Back to sign in →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
