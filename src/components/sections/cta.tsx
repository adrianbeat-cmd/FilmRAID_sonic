'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';

const CTA = () => {
  const pathname = usePathname();
  const shouldShowCTA = !['/privacy-policy', '/terms-of-service'].includes(pathname);

  if (!shouldShowCTA) return null;

  return (
    <section className="bg-[#f7f7f5] dark:bg-[#111111]">
      <div className="section-padding container">
        <div className="border-t border-gray-200 pt-16 md:pt-24 dark:border-gray-800">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* Left — headline */}
            <div className="max-w-xl">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
                Ready to order?
              </p>
              <h2 className="text-4xl leading-tight font-bold tracking-tight text-black md:text-5xl dark:text-white">
                Pre-configured.
                <span className="block font-normal text-gray-400">Ships in 3 days.</span>
              </h2>
            </div>

            {/* Right — CTA */}
            <div className="flex flex-col gap-3">
              <AnimatedBorderButton
                asChild
                className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
              >
                <Link href="/configs">
                  See Models & Prices <ChevronRight />
                </Link>
              </AnimatedBorderButton>
              <p className="text-center text-xs text-gray-400">
                VAT calculated at checkout · FedEx EU delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
