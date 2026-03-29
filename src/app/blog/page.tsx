import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Bizno",
  description: "Tips, guides, and insights for launching and growing your business.",
};

const POSTS = [
  {
    title: "The Ultimate Business Launch Checklist",
    excerpt: "Everything you need to do before launching your business, from legal setup to marketing preparation.",
    category: "Guide",
    author: "Sarah K.",
    date: "Mar 15, 2026",
    readTime: "8 min read",
    initials: "SK",
  },
  {
    title: "How to Choose the Right Business Structure",
    excerpt: "Sole trader, LTD, or partnership? We break down the pros and cons of each legal structure.",
    category: "Legal",
    author: "James M.",
    date: "Mar 10, 2026",
    readTime: "6 min read",
    initials: "JM",
  },
  {
    title: "10 Essential Tools for New Businesses",
    excerpt: "The must-have software stack for modern businesses — from accounting to project management.",
    category: "Tools",
    author: "Priya R.",
    date: "Mar 5, 2026",
    readTime: "5 min read",
    initials: "PR",
  },
  {
    title: "Building Your Brand on a Budget",
    excerpt: "How to create a professional brand identity without spending thousands on designers.",
    category: "Branding",
    author: "Sarah K.",
    date: "Feb 28, 2026",
    readTime: "7 min read",
    initials: "SK",
  },
  {
    title: "The First 30 Days: What to Focus On",
    excerpt: "Your first month as a new business owner is critical. Here's how to prioritize your time.",
    category: "Strategy",
    author: "James M.",
    date: "Feb 20, 2026",
    readTime: "10 min read",
    initials: "JM",
  },
  {
    title: "Common Mistakes First-Time Founders Make",
    excerpt: "Learn from others' mistakes. We share the most common pitfalls and how to avoid them.",
    category: "Advice",
    author: "Priya R.",
    date: "Feb 15, 2026",
    readTime: "6 min read",
    initials: "PR",
  },
];

const CATEGORIES = ["All", "Guide", "Legal", "Tools", "Branding", "Strategy", "Advice"];

export default function BlogPage() {
  return (
    <MarketingPageShell ctaHref="/login" ctaLabel="Get Started Free">
      <Card variant="gradient" hover="lift" padding="lg" className="relative overflow-hidden animate-fade-up">
        <div className="absolute -right-20 top-8 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[var(--purple)]/10 blur-3xl" aria-hidden />
        
        <div className="relative text-center max-w-3xl mx-auto">
          <Badge variant="default" className="uppercase tracking-widest mb-6">Blog</Badge>
          <h1 className="font-display text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
            Launch insights
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Tips, guides, and stories to help you build a successful business.
          </p>
        </div>
      </Card>

      {/* Categories */}
      <div className="mt-10 flex flex-wrap gap-2 justify-center animate-fade-up">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              cat === "All"
                ? "bg-[var(--electric)] text-[var(--text-inverse)]"
                : "bg-[var(--dark-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <Card
            key={post.title}
            variant="default"
            hover="lift"
            padding="none"
            className="overflow-hidden animate-fade-up"
          >
            <div className="h-48 bg-gradient-to-br from-[var(--dark-1)] to-[var(--dark-2)] flex items-center justify-center">
              <span className="text-4xl opacity-20">📝</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" size="sm">{post.category}</Badge>
                <span className="text-xs text-[var(--text-tertiary)]">{post.readTime}</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] line-clamp-2">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar size="sm" fallback={post.initials} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{post.author}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{post.date}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Newsletter */}
      <Card variant="elevated" padding="lg" className="mt-16 text-center animate-fade-up">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Get launch tips in your inbox</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Subscribe to our weekly newsletter for exclusive tips, deals, and founder stories.
        </p>
        <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 px-4 py-3 rounded-lg bg-[var(--dark-2)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--electric)] focus:outline-none"
          />
          <button className="px-6 py-3 rounded-lg bg-[var(--electric)] text-[var(--text-inverse)] font-semibold hover:brightness-110 transition">
            Subscribe
          </button>
        </form>
      </Card>
    </MarketingPageShell>
  );
}
