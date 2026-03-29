"use client";

import { useState } from "react";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !localStorage.getItem("cookie-consent");
  });

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-2 border-t border-white/10 p-4 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300">
          <p>
            We use essential cookies for authentication and privacy-focused analytics 
            to improve your experience.{" "}
            <a href="/privacy" className="text-electric hover:underline">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm bg-electric text-void font-medium rounded-lg hover:bg-electric/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
