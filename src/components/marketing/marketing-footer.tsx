import Link from "next/link";

export const MarketingFooter = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/35">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Bizno</p>
          <p className="text-sm text-slate-400">
            A simple way to keep every launch on track.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Product</p>
          <div className="flex flex-col gap-1 text-sm text-slate-400">
            <Link href="/features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="/pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/upgrade" className="transition hover:text-white">
              Upgrade
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Company</p>
          <div className="flex flex-col gap-1 text-sm text-slate-400">
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link href="/login" className="transition hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
