import Link from "next/link";

export const MarketingNav = ({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-electric text-sm font-bold text-black">
            Bz
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">
              Bizno
            </p>
            <p className="text-sm font-medium text-white">Launch made simple</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-slate-400 md:flex">
          <Link href="/features" className="transition hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href={ctaHref}
            className="inline-flex rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
};
