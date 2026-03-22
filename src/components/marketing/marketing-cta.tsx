import Link from "next/link";

export const MarketingCta = () => {
  return (
    <section className="glass-panel relative mt-16 overflow-hidden p-8 sm:p-10">
      <div className="relative">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-electric/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-sky-400/15 blur-2xl"
          aria-hidden
        />
        <div className="relative space-y-5">
          <p className="text-xs uppercase tracking-[0.45em] text-electric">Ready when you are</p>
          <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
            Stop juggling launch tasks in random docs.
          </h2>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Give your team one clear place to plan, do the work, and track progress.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-lg bg-electric px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
