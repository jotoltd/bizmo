import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const MarketingCta = () => {
  return (
    <section className="glass-panel relative mt-16 overflow-hidden p-8 sm:p-10 animate-fade-up">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--electric)]/10 blur-3xl" aria-hidden />
      <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[var(--purple)]/10 blur-3xl" aria-hidden />
      <div className="relative space-y-5">
        <Badge variant="default" className="uppercase tracking-widest">Ready when you are</Badge>
        <h2 className="max-w-2xl text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          Stop juggling launch tasks in random docs.
        </h2>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
          Give your team one clear place to plan, do the work, and track progress.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">Compare plans</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
