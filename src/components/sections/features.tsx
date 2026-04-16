import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

const features = [
  {
    number: '01',
    label: 'Speed & Reliability',
    title: 'Sustained transfers up to 5000MB/s.',
    description:
      'Built on Areca controllers with enterprise-grade SAS drives. Handles 4K, 6K, and 8K workflows without bottlenecks — on set or in post. Dual Thunderbolt 5 ports, backward compatible with TB3 and TB4.',
    image: '/layout/feature-1.png',
    imageLeft: true,
    link: { text: 'Configure now', href: '/configs' },
  },
  {
    number: '02',
    label: 'High-Capacity Storage',
    title: 'From 72TB to 288TB — drives included.',
    description:
      'Toshiba and Seagate enterprise SAS drives, pre-installed. Choose your RAID level for the right balance of speed, capacity, and redundancy.',
    image: '/layout/feature-2.png',
    imageLeft: false,
    link: { text: 'See models', href: '/catalog' },
  },
  {
    number: '03',
    label: 'Secure & Versatile',
    title: 'Dual Thunderbolt 5, DisplayPort 2.1, USB-C, Ethernet.',
    description:
      'Connects directly to your Mac at up to 80Gb/s (120Gb/s with Bandwidth Boost). Backward compatible with Thunderbolt 3 and 4. Ships fully configured with a 3-year warranty — ready to plug in and use.',
    image: '/layout/feature-3.png',
    imageLeft: true,
    link: { text: 'Learn more', href: '/about' },
  },
];

const Features = () => {
  return (
    <section className="w-full">
      {features.map((feature) => (
        <div
          key={feature.number}
          className={`flex flex-col md:flex-row ${!feature.imageLeft ? 'md:flex-row-reverse' : ''}`}
        >
          {/* Image side — full bleed, no container */}
          <div className="flex w-full items-center justify-center bg-[#f0f0ee] py-16 md:w-1/2 md:py-24 dark:bg-[#141414]">
            <Image
              src={feature.image}
              alt={feature.label}
              width={500}
              height={500}
              className="h-auto w-full max-w-[420px] object-contain drop-shadow-xl md:max-w-[480px]"
            />
          </div>

          {/* Text side — white background */}
          <div className="flex w-full flex-col justify-center bg-white px-8 py-16 md:w-1/2 md:px-16 md:py-24 dark:bg-[#0a0a0a]">
            <div className="max-w-md">
              <div className="mb-6 flex items-baseline gap-4">
                <span className="text-xs font-semibold tracking-[0.2em] text-gray-300 dark:text-gray-600">
                  {feature.number}
                </span>
                <span className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                  {feature.label}
                </span>
              </div>

              <h3 className="mb-6 text-3xl leading-tight font-bold tracking-tight text-black md:text-4xl dark:text-white">
                {feature.title}
              </h3>

              <p className="mb-8 text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
                {feature.description}
              </p>

              <Link
                href={feature.link.href}
                className="group/link inline-flex items-center gap-1 text-sm font-medium text-black transition-opacity hover:opacity-50 dark:text-white"
              >
                {feature.link.text}
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Features;
