import Link from "next/link";
import { PlanBadge } from "@/components/dashboard/plan-badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import type { PlanTier, UserRole } from "@/types";

export const TopNav = ({
  email,
  plan,
  role,
}: {
  email: string;
  plan: PlanTier;
  role?: UserRole;
}) => {
  const initial = email.charAt(0).toUpperCase();
  return (
    <header className="w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold">
          <div className="h-10 w-10 rounded-xl bg-electric text-black grid place-items-center text-base font-bold">
            Bz
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Bizno</p>
            <p className="text-white">Digital Readiness OS</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <PlanBadge plan={plan} />
          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-electric transition hover:text-white sm:block"
            >
              Admin panel →
            </Link>
          )}
          {plan === "free" && (
            <Link
              href="/upgrade"
              className="hidden text-sm font-medium text-electric transition hover:text-white sm:block"
            >
              Upgrade to unlock Pro →
            </Link>
          )}
          <form action={signOutAction}>
            <Button variant="ghost" className="hidden text-sm text-slate-300 hover:text-white sm:inline-flex">
              Log out
            </Button>
          </form>
          <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-sm font-semibold">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
};
