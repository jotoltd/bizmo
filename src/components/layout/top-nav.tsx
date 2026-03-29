"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import type { UserRole, BusinessInvitation } from "@/types";
import { NotificationDropdown } from "./notification-dropdown";

export const TopNav = ({
  email,
  role,
  invitations = [],
  onAcceptInvitation,
  onRejectInvitation,
}: {
  email: string;
  role?: UserRole;
  invitations?: BusinessInvitation[];
  onAcceptInvitation?: (invitationId: string) => Promise<void>;
  onRejectInvitation?: (invitationId: string) => Promise<void>;
}) => {
  const initial = email.charAt(0).toUpperCase();
  const unreadCount = invitations.filter((i) => i.status === "pending").length;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3 text-lg font-semibold">
          <div className="h-10 w-10 rounded-xl bg-electric text-black grid place-items-center text-base font-bold">
            Bz
          </div>
          <div className="hidden sm:block">
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Bizno</p>
            <p className="text-white">Digital Readiness OS</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <NotificationDropdown
            unreadCount={unreadCount}
            invitations={invitations}
            onAccept={onAcceptInvitation}
            onReject={onRejectInvitation}
          />

          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-electric transition hover:text-white sm:block"
            >
              Admin panel →
            </Link>
          )}

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Open user menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-semibold">
                {initial}
              </span>
              <span className="hidden max-w-36 truncate text-xs sm:block">{email}</span>
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-black/95 p-1 shadow-2xl backdrop-blur-xl"
              >
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/notifications"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Notifications
                </Link>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Settings
                </Link>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Admin panel
                  </Link>
                )}
                <div className="my-1 h-px bg-white/10" />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-500/20 hover:text-rose-100"
                  >
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
