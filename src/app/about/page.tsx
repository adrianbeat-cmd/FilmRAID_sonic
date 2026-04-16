import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

export default function About() {
  return (
    <section className="section-padding container max-w-4xl">
      {/* Header */}
      <div className="mb-16">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">About</p>
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Professional RAID storage
          <span className="block font-normal text-gray-400">built for filmmakers.</span>
        </h1>
      </div>

      {/* Who we are */}
      <div className="border-t border-gray-200 py-12 dark:border-gray-800">
        <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Who we are
        </p>
        <p className="max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          FilmRAID is a specialized company focused on high-performance RAID systems for digital
          cinema and video professionals. We configure and deliver reliable storage solutions
          optimized for real film production workflows — from single-camera DITs to multi-camera
          broadcast facilities.
        </p>
      </div>

      {/* Why FilmRAID */}
      <div className="border-t border-gray-200 py-12 dark:border-gray-800">
        <p className="mb-8 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Why FilmRAID
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: 'Built for film',
              desc: 'Every system is configured specifically for film and video production workflows — not generic IT storage.',
            },
            {
              title: 'Enterprise hardware only',
              desc: 'Areca RAID controllers and Toshiba or Seagate enterprise SAS drives. No consumer-grade components.',
            },
            {
              title: 'EU delivery in 3 days',
              desc: 'Shipped via FedEx from Barcelona. Ready to plug in and use the moment it arrives.',
            },
            {
              title: 'Full support included',
              desc: '3-year warranty on the enclosure, 5-year on the drives. We handle all warranty claims directly.',
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="mb-2 text-base font-semibold text-black dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Information */}
      <div className="border-t border-gray-200 py-12 dark:border-gray-800">
        <p className="mb-8 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Company Information
        </p>
        <div className="grid gap-6 text-sm md:grid-cols-2">
          {[
            { label: 'Legal Name', value: 'The DIT World Company S.L.U.' },
            { label: 'VAT Number', value: 'ESB10680478' },
            { label: 'Address', value: 'Carrer del Valles 55, 08030 Barcelona, Spain' },
            { label: 'Contact', value: 'hello@filmraid.pro', href: 'mailto:hello@filmraid.pro' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-black transition-opacity hover:opacity-60 dark:text-white"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-black dark:text-white">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-gray-200 pt-12 dark:border-gray-800">
        <Link
          href="/catalog"
          className="group inline-flex items-center gap-1 text-sm font-medium text-black transition-opacity hover:opacity-50 dark:text-white"
        >
          Browse All Systems
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
