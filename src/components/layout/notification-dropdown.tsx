"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, X, Check, UserPlus, Clock } from "lucide-react";
import type { BusinessInvitation } from "@/types";

interface NotificationDropdownProps {
  unreadCount: number;
  invitations: BusinessInvitation[];
  onAccept?: (invitationId: string) => Promise<void>;
  onReject?: (invitationId: string) => Promise<void>;
}

export const NotificationDropdown = ({
  unreadCount,
  invitations,
  onAccept,
  onReject,
}: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (invitationId: string) => {
    if (!onAccept) return;
    setProcessingId(invitationId);
    await onAccept(invitationId);
    setProcessingId(null);
  };

  const handleReject = async (invitationId: string) => {
    if (!onReject) return;
    setProcessingId(invitationId);
    await onReject(invitationId);
    setProcessingId(null);
  };

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = 7 - Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-electric/40 hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-1rem)] rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <p className="text-xs text-slate-500">Team invites and updates</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
              className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto p-3">
            {invitations.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">No notifications right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-electric/30 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-amber-400/20 bg-amber-500/15 p-2 text-amber-300">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          Business invitation
                        </p>
                        <p className="text-xs text-slate-400">
                          You were invited to join a business
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          From: {invitation.invited_by_email || "Unknown"}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>Expires in {getDaysRemaining(invitation.created_at)} days</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(invitation.id)}
                            disabled={processingId === invitation.id || !onAccept}
                            className="inline-flex items-center gap-1 rounded-lg bg-electric px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" />
                            {processingId === invitation.id ? "Accepting..." : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(invitation.id)}
                            disabled={processingId === invitation.id || !onReject}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
