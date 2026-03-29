"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/admin/roadmap/preview", label: "Preview", icon: "🧪" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/businesses", label: "Businesses", icon: "🏢" },
  { href: "/admin/support", label: "Support", icon: "🎫" },
  { href: "/admin/comms", label: "Comms", icon: "🔔" },
] as const;

export const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-white/5 bg-black/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-electric text-xs font-bold text-black">
            Bz
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Bizno Admin</p>
            <p className="text-[0.6rem] text-slate-500">Control Panel</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors",
                isActive(item.href)
                  ? "border-electric/40 bg-electric/10 text-electric"
                  : "border-white/10 text-slate-400 hover:text-white"
              )}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-electric text-xs font-bold text-black">
            Bz
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Bizno Admin</p>
            <p className="text-[0.6rem] text-slate-500">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-electric/10 font-semibold text-electric"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/5 px-5 py-4">
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 transition-colors hover:text-electric"
          >
            ← Back to app
          </Link>
        </div>
      </aside>
    </>
  );
};
