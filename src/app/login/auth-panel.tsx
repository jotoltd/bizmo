"use client";

import { useMemo } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { envClient } from "@/lib/env-client";

export const AuthPanel = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const themeVariables = {
    colors: {
      brand: "#4DE2FF",
      brandAccent: "#5ef1ff",
      brandButtonText: "#020617",
      inputBackground: "rgba(15,23,42,0.6)",
      inputBorder: "rgba(255,255,255,0.08)",
      anchorTextColor: "#4DE2FF",
    },
    fonts: {
      bodyFontFamily: "var(--font-geist-sans)",
    },
    radii: {
      buttonBorderRadius: "12px",
      inputBorderRadius: "12px",
    },
  } as const;

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass-panel max-w-md w-full p-10 space-y-8">
        <div className="space-y-3 text-center">
          <p className="uppercase text-xs tracking-[0.4em] text-electric">
            Welcome to Bizno
          </p>
          <h1 className="text-3xl font-semibold">Digital readiness begins here</h1>
          <p className="text-sm text-slate-400">
            Launch an account, add your business, and follow a curated roadmap
            that keeps every digital asset on track.
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          redirectTo={`${envClient.siteUrl}/auth/callback`}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: themeVariables,
              dark: themeVariables,
            },
            className: {
              container: "rounded-2xl",
              button: "font-medium",
              input: "text-base",
            },
          }}
          theme="dark"
        />
      </div>
    </div>
  );
};
