import type { Metadata } from "next";
import { Sora, Manrope, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Stack rationale:
 * - Next.js App Router + React Server Components for fast SaaS UX and streaming data.
 * - Supabase (Auth + Postgres) for secure multi-tenant storage without custom infra.
 * - Tailwind + utility primitives for rapid iteration on a dark, responsive UI.
 */

const bodySans = Manrope({
  variable: "--font-body-sans",
  subsets: ["latin"],
});

const displaySans = Sora({
  variable: "--font-display-sans",
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
      className={`${bodySans.variable} ${displaySans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-slate-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
