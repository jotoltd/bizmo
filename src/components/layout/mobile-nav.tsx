"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Building2, Bell, User, Settings } from "lucide-react";
import type { UserRole } from "@/types";

interface MobileNavProps {
  role?: UserRole;
  unreadCount?: number;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard", label: "Businesses", icon: Building2 },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav({ role, unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Spacer for bottom nav */}
      <div className="h-20 sm:hidden" />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden safe-area-bottom">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />
        
        {/* Nav items */}
        <div className="relative flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center gap-1 px-4 py-2"
              >
                <div className="relative">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-2 rounded-xl transition-colors ${
                      isActive 
                        ? "bg-electric/20 text-electric" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="mobileNavIndicator"
                        className="absolute inset-0 rounded-xl bg-electric/20"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </motion.div>

                  {/* Notification badge */}
                  {item.label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-electric" : "text-slate-400"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Home indicator area for iOS */}
        <div className="h-2 bg-black/80" />
      </nav>
    </>
  );
}

// Mobile hamburger menu for top nav
export function MobileMenu({ 
  isOpen, 
  onClose,
  role,
  onSignOut 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  role?: UserRole;
  onSignOut?: () => void;
}) {
  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
    ...(role === "admin" ? [{ href: "/admin", label: "Admin Panel", icon: User }] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
        />
      )}

      {/* Slide-out menu */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-[var(--surface)] border-l border-white/10 shadow-2xl sm:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-semibold text-white">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu items */}
          <div className="flex-1 py-4 px-2 space-y-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sign out */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-200 hover:bg-rose-500/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

          {/* Safe area */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </motion.div>
    </>
  );
}
