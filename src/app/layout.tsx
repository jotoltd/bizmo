import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Stack rationale:
 * - Next.js App Router + React Server Components for fast SaaS UX and streaming data.
 * - Supabase (Auth + Postgres) for secure multi-tenant storage without custom infra.
 * - Tailwind + utility primitives for rapid iteration on a dark, responsive UI.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bizno · Digital Readiness OS",
  description:
    "Bizno is the digital readiness platform for modern businesses. Track every launch task from domain to growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-slate-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
