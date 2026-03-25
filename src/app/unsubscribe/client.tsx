"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { unsubscribeEmailAction, getUnsubscribeInfoAction } from "./actions";

export default function UnsubscribePage({
  userId,
  emailType,
  token,
}: {
  userId: string;
  emailType: string;
  token: string;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // First get user info
    getUnsubscribeInfoAction(userId, emailType).then((result) => {
      if (result.email) {
        setEmail(result.email);
      }
    });

    // Then perform unsubscribe
    startTransition(async () => {
      const result = await unsubscribeEmailAction({
        userId,
        emailType: emailType as any,
        token,
      });

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage(`You have been unsubscribed from ${result.emailType ?? "these emails"}.`);
      }
    });
  }, [userId, emailType, token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel max-w-md w-full p-8 text-center space-y-6">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-electric text-black grid place-items-center text-xl font-bold">
            Bz
          </div>
          <h1 className="text-2xl font-semibold">Email Preferences</h1>
        </div>

        {status === "loading" || isPending ? (
          <div className="py-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-electric border-t-transparent" />
            <p className="mt-3 text-slate-400">Processing your request...</p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-green-400 font-medium">Unsubscribe successful</p>
              <p className="text-sm text-slate-300 mt-1">{message}</p>
            </div>
            {email && (
              <p className="text-sm text-slate-400">
                Unsubscribe applied for: <span className="text-slate-200">{email}</span>
              </p>
            )}
            <Link
              href="/settings"
              className="inline-block rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Manage all preferences
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
              <p className="text-rose-400 font-medium">Something went wrong</p>
              <p className="text-sm text-slate-300 mt-1">{message}</p>
            </div>
            <p className="text-sm text-slate-400">
              Please try again or contact support if the issue persists.
            </p>
            <Link
              href="/settings"
              className="inline-block rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
