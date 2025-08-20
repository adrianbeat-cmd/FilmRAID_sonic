import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { Button } from '../ui/button';

export default function WhySonic() {
  return (
    <section className="relative flex min-h-[420px] w-full items-center md:min-h-[512px] 2xl:min-h-[700px]">
      <div className="absolute inset-0">
        <Image
          src="/images/products/product-5.webp"
          alt="Sonic Product"
          fill
          className="object-cover"
        />
      </div>
      <div className="from-base-dark dark:from-background absolute inset-0 bg-linear-to-r to-transparent" />
      <div className="relative z-10 container">
        <h2 className="text-background dark:text-foreground text-5xl font-bold md:text-6xl">
          Why Sonic?
        </h2>
        <p className="text-background dark:text-foreground mt-4 mb-8 max-w-2xl text-xl">
          Every Sonic speaker is engineered for real life—compact yet bold, tough yet refined.
          Whether you're deep in a busy city or off the grid, Sonic delivers consistent,
          high-quality audio in a sleek form you'll love to show off.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="group dark:text-background dark:bg-foreground rounded-full"
          asChild
        >
          <Link href="/pricing">
            Buy now
            <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
