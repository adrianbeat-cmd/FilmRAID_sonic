import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

const features = [
  {
    number: '01',
    label: 'Speed & Reliability',
    title: 'Sustained transfers up to 2600MB/s.',
    description:
      'Built on Areca controllers with enterprise-grade SAS drives. Handles 4K, 6K, and 8K workflows without bottlenecks — on set or in post.',
    image: '/layout/feature-1.png',
    link: { text: 'Configure now', href: '/configs' },
  },
  {
    number: '02',
    label: 'High-Capacity Storage',
    title: 'From 72TB to 288TB — drives included.',
    description:
      'Toshiba and Seagate enterprise SAS drives, pre-installed. Choose your RAID level for the right balance of speed, capacity, and redundancy.',
    image: '/layout/feature-2.png',
    link: { text: 'See models', href: '/catalog' },
  },
  {
    number: '03',
    label: 'Secure & Versatile',
    title: 'Dual Thunderbolt 3, DisplayPort, USB-C, Ethernet.',
    description:
      'Connects directly to your Mac at up to 40Gb/s. Ships fully configured with a 3-year warranty — ready to plug in and use.',
    image: '/layout/feature-3.png',
    link: { text: 'Learn more', href: '/about' },
  },
];

const Features = () => {
  return (
    <section className="section-padding container">
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {features.map((feature) => (
          <div
            key={feature.number}
            className="group grid grid-cols-1 gap-6 py-10 md:grid-cols-12 md:gap-12 md:py-14"
          >
            {/* Number */}
            <div className="md:col-span-1">
              <span className="text-xs font-semibold tracking-[0.2em] text-gray-400">
                {feature.number}
              </span>
            </div>

            {/* Label + Title + Description + CTA */}
            <div className="flex flex-col gap-4 md:col-span-6">
              <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                {feature.label}
              </p>
              <h3 className="text-2xl leading-tight font-bold tracking-tight text-black md:text-3xl dark:text-white">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
              <Link
                href={feature.link.href}
                className="group/link mt-2 inline-flex items-center gap-1 text-sm font-medium text-black transition-opacity hover:opacity-60 dark:text-white"
              >
                {feature.link.text}
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-0.5"
                />
              </Link>
            </div>

            {/* Image — smaller, right aligned */}
            <div className="flex items-center justify-center md:col-span-5 md:justify-end">
              <div className="relative h-48 w-full max-w-xs overflow-hidden rounded-2xl bg-gray-100 md:h-56 dark:bg-gray-900">
                <Image
                  src={feature.image}
                  alt={feature.label}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
