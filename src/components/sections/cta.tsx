'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';
// Force redeploy to update 3-day delivery - Oct 20, 2025
const CTA = () => {
  const pathname = usePathname();
  const shouldShowCTA = !['/privacy-policy', '/terms-of-service'].includes(pathname);

  if (!shouldShowCTA) return null;

  return (
    <section className="bg-card py-15">
      <div className="container flex flex-col justify-between gap-8 md:flex-row md:gap-16">
        <div className="space-y-6 sm:min-w-[440px] md:space-y-8 lg:w-[569px] lg:shrink-0">
          <h2 className="text-5xl leading-13 font-bold md:text-6xl md:leading-18">
            Secure Your Film Data Today
          </h2>

          <AnimatedBorderButton
            asChild
            wrapperClassName="w-fit"
            className="gap-2.5 pe-3 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.25"
          >
            <Link href="/configs">
              Configure Now
              <span className="bg-background text-foreground rounded-full p-2">
                <ChevronRight />
              </span>
            </Link>
          </AnimatedBorderButton>
        </div>
        <div className="max-w-xl space-y-4">
          <h3 className="text-3xl font-bold">Elevate Your Production Workflow</h3>
          <p className="text-xl leading-8">
            Don't risk data loss or slow transfers. Our pre-configured RAID systems deliver
            unmatched speed, security, and 3-day EU delivery – perfect for filmmakers ready to focus
            on creating, not waiting.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
