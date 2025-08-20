import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <section className="section-padding container space-y-10.5 text-center">
      <h2 className="text-3xl font-bold">About FilmRAID</h2>
      <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
        FilmRAID offers custom RAID storage solutions for digital cinema professionals. We provide
        2-day EU delivery with secure, fast transfers tailored for filmmakers.
      </p>
      <h3 className="text-2xl font-bold">Why FilmRAID?</h3>
      <ul className="mx-auto max-w-3xl list-disc space-y-4 pl-6 text-left text-lg text-gray-600 dark:text-gray-300">
        <li>Cinema-optimized RAID configurations for fast backups and workflows.</li>
        <li>Secure data redundancy with RAID levels like 5 and 6.</li>
        <li>EU-wide 2-day delivery to keep costs low.</li>
        <li>AI-assisted support via Grok for quick config help.</li>
      </ul>
      <Button variant="outline" size="lg" className="rounded-full" asChild>
        <Link href="/configs">
          Configure Your RAID Now <ChevronRight />
        </Link>
      </Button>
    </section>
  );
}
