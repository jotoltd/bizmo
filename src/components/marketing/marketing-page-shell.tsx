import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

type MarketingPageShellProps = {
  children: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export const MarketingPageShell = ({
  children,
  ctaHref = "/login",
  ctaLabel = "Start free",
}: MarketingPageShellProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-[-160px] h-[340px] w-[340px] rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden
      />
      <MarketingNav ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};
