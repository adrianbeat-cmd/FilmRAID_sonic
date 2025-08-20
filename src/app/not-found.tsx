import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '@/components/animated-border-button';

export default function NotFound() {
  return (
    <section className="container flex min-h-[75vh] flex-col items-center justify-center gap-8 text-center">
      <h1 className="text-5xl font-bold md:text-6xl">Page Not Found</h1>
      <p className="max-w-3xl text-xl">
        It looks like the page you're looking for doesn't exist. Maybe it was moved, deleted, or
        never existed in the first place.
      </p>
      <AnimatedBorderButton
        asChild
        className="rounded-full [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
      >
        <Link href="/">
          Homepage <ChevronRight />
        </Link>
      </AnimatedBorderButton>
    </section>
  );
}
