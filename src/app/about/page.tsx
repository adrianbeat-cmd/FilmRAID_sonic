import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <section className="section-padding container max-w-4xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">About FilmRAID</h1>
        <p className="text-muted-foreground mt-4 text-xl">
          Professional RAID storage solutions built for filmmakers by filmmakers.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        {/* Who we are */}
        <div>
          <h2 className="text-2xl font-semibold">Who we are</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            FilmRAID is a small, specialized company founded by Adri (a working DIT) and Ale Matus.
            We configure and sell high-performance RAID systems optimized for digital cinema
            workflows.
          </p>
        </div>

        {/* Company Information */}
        <div className="rounded-2xl border bg-gray-50 p-8 dark:bg-gray-900">
          <h3 className="text-xl font-semibold">Company Information</h3>
          <div className="mt-6 grid gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="font-medium">Legal Name</p>
              <p>The DIT World Company S.L.U.</p>
            </div>
            <div>
              <p className="font-medium">VAT Number</p>
              <p>ESB10680478</p>
            </div>
            <div>
              <p className="font-medium">Address</p>
              <p>
                Carrer del Valles 55, 1-2
                <br />
                08030 Barcelona, Spain
              </p>
            </div>
            <div>
              <p className="font-medium">Contact</p>
              <p>
                <a href="mailto:hello@filmraid.pro" className="hover:underline">
                  hello@filmraid.pro
                </a>
                <br />
                <a href="mailto:adri@filmraid.pro" className="hover:underline">
                  adri@filmraid.pro
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Why FilmRAID */}
        <div>
          <h2 className="text-2xl font-semibold">Why FilmRAID?</h2>
          <ul className="mt-6 space-y-4 text-lg text-gray-600 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              Built by a working DIT — we understand real film production needs
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              Only enterprise-grade drives and Areca hardware
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              Fast 3-day delivery across Europe (FedEx)
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              Full support and configuration help
            </li>
          </ul>
        </div>

        {/* Call to action */}
        <div className="pt-8 text-center">
          <Button variant="default" size="lg" asChild>
            <Link href="/catalog">
              Browse All Systems <ChevronRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
