import { requireProfile } from "@/lib/auth";
import { getUserNotifications, markNotificationsAsRead } from "@/lib/business";
import { TopNav } from "@/components/layout/top-nav";
import Link from "next/link";
import {
  acceptBusinessInvitationAction,
  rejectBusinessInvitationAction,
} from "@/app/dashboard/actions";
import {
  Bell,
  Check,
  X,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  Clock,
  Megaphone,
  Sparkles,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

type NotificationsPageProps = {
  searchParams: Promise<{ filter?: string }>;
};

const FILTERS = ["all", "tasks", "deadlines", "team"] as const;

type NotificationFilter = (typeof FILTERS)[number];

const NOTIFICATION_FILTER_TYPES: Record<Exclude<NotificationFilter, "all">, string[]> = {
  tasks: ["task_completed", "task_assigned"],
  deadlines: ["deadline_approaching", "deadline_missed"],
  team: [
    "invitation_received",
    "invitation_accepted",
    "invitation_rejected",
    "invitation_expired",
    "member_removed",
    "role_changed",
    "ownership_transferred",
  ],
};

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const { filter } = await searchParams;
  const currentFilter = FILTERS.includes((filter as NotificationFilter) ?? "all")
    ? ((filter as NotificationFilter) ?? "all")
    : "all";
  const profile = await requireProfile();
  const notifications = await getUserNotifications(profile.id);
  const filteredNotifications =
    currentFilter === "all"
      ? notifications
      : notifications.filter((notification) =>
          NOTIFICATION_FILTER_TYPES[currentFilter].includes(notification.type)
        );

  const getIcon = (type: string) => {
    switch (type) {
      case "invitation_received":
        return <UserPlus className="h-5 w-5 text-amber-400" />;
      case "invitation_accepted":
        return <Check className="h-5 w-5 text-green-400" />;
      case "invitation_rejected":
        return <X className="h-5 w-5 text-red-400" />;
      case "member_removed":
        return <UserMinus className="h-5 w-5 text-red-400" />;
      case "role_changed":
        return <Shield className="h-5 w-5 text-electric" />;
      case "ownership_transferred":
        return <Crown className="h-5 w-5 text-amber-400" />;
      case "invitation_expired":
        return <Clock className="h-5 w-5 text-slate-400" />;
      case "system_alert":
        return <Megaphone className="h-5 w-5 text-rose-300" />;
      case "business_update":
        return <Sparkles className="h-5 w-5 text-electric" />;
      case "deadline_approaching":
        return <CalendarClock className="h-5 w-5 text-amber-400" />;
      case "deadline_missed":
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case "task_completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "task_assigned":
        return <UserCheck className="h-5 w-5 text-electric" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav
        email={profile.email}
        plan={profile.plan}
        role={profile.role}
        invitations={[]}
        onAcceptInvitation={async (invitationId: string) => {
          "use server";
          await acceptBusinessInvitationAction({ invitationId });
        }}
        onRejectInvitation={async (invitationId: string) => {
          "use server";
          await rejectBusinessInvitationAction({ invitationId });
        }}
      />
      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 lg:py-12">
        <div className="grid-mask absolute inset-0 opacity-40" aria-hidden />

        <div className="relative space-y-6">
          <div className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-electric">Notifications</p>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">All Notifications</h1>
              <p className="mt-1 text-sm text-slate-400">Invites, team actions, and account updates</p>
            </div>
            <form
              action={async () => {
                "use server";
                await markNotificationsAsRead(profile.id);
              }}
            >
              <button className="rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                Mark all as read
              </button>
            </form>
          </div>

          <div className="glass-panel flex flex-wrap gap-2 p-3">
            {FILTERS.map((tab) => {
              const active = tab === currentFilter;
              const href = tab === "all" ? "/notifications" : `/notifications?filter=${tab}`;
              return (
                <Link
                  key={tab}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    active
                      ? "border border-electric/40 bg-electric/10 text-electric"
                      : "border border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {tab}
                </Link>
              );
            })}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="glass-panel border border-white/10 p-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <h2 className="text-xl font-semibold text-white">No notifications in this filter</h2>
              <p className="mt-2 text-sm text-slate-400">
                You&apos;ll see updates about invitations, team changes, and announcements here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`glass-panel flex items-start gap-4 border p-4 transition ${
                    !notification.read
                      ? "border-electric/30 bg-electric/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h3 className="font-medium text-white">{notification.title}</h3>
                      {!notification.read && (
                        <span className="rounded-full border border-electric/40 bg-electric/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-electric">
                          New
                        </span>
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-sm text-slate-400">{notification.body}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                    {notification.type === "invitation_received" && (
                      <div className="mt-3 flex gap-2">
                        <form
                          action={async () => {
                            "use server";
                            const invitationId = notification.data?.invitation_id as string;
                            if (invitationId) {
                              await acceptBusinessInvitationAction({ invitationId });
                            }
                          }}
                        >
                          <button className="rounded-lg bg-electric px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110">
                            Accept
                          </button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            const invitationId = notification.data?.invitation_id as string;
                            if (invitationId) {
                              await rejectBusinessInvitationAction({ invitationId });
                            }
                          }}
                        >
                          <button className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                            Decline
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
