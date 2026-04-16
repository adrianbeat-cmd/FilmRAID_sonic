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
    bg: 'linear-gradient(135deg, #e8e8e6 0%, #f0f0ee 60%, #e4e4e2 100%)',
    bgDark: 'linear-gradient(135deg, #1a1a1a 0%, #141414 60%, #111111 100%)',
    link: { text: 'Configure now', href: '/configs' },
  },
  {
    number: '02',
    label: 'High-Capacity Storage',
    title: 'From 72TB to 288TB — drives included.',
    description:
      'Toshiba and Seagate enterprise SAS drives, pre-installed. Choose your RAID level for the right balance of speed, capacity, and redundancy.',
    image: '/layout/feature-2.png',
    bg: 'linear-gradient(135deg, #eceae8 0%, #f2f0ee 60%, #e8e6e4 100%)',
    bgDark: 'linear-gradient(135deg, #1c1a18 0%, #161412 60%, #121010 100%)',
    link: { text: 'See models', href: '/catalog' },
  },
  {
    number: '03',
    label: 'Secure & Versatile',
    title: 'Dual Thunderbolt 3, DisplayPort, USB-C, Ethernet.',
    description:
      'Connects directly to your Mac at up to 40Gb/s. Ships fully configured with a 3-year warranty — ready to plug in and use.',
    image: '/layout/feature-3.png',
    bg: 'linear-gradient(135deg, #e6e8e8 0%, #eef0f0 60%, #e2e4e4 100%)',
    bgDark: 'linear-gradient(135deg, #181a1a 0%, #121414 60%, #101212 100%)',
    link: { text: 'Learn more', href: '/about' },
  },
];

const Features = () => {
  return (
    <section className="section-padding container">
      <div className="flex flex-col gap-24 md:gap-32">
        {features.map((feature, index) => (
          <div
            key={feature.number}
            className={`flex flex-col items-center gap-12 md:flex-row md:gap-16 ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Image on controlled gradient background */}
            <div className="w-full md:w-1/2">
              <div
                className="flex items-center justify-center p-12 dark:hidden"
                style={{ background: feature.bg }}
              >
                <Image
                  src={feature.image}
                  alt={feature.label}
                  width={500}
                  height={500}
                  className="h-auto w-full max-w-xs object-contain drop-shadow-xl"
                />
              </div>
              <div
                className="hidden items-center justify-center p-12 dark:flex"
                style={{ background: feature.bgDark }}
              >
                <Image
                  src={feature.image}
                  alt={feature.label}
                  width={500}
                  height={500}
                  className="h-auto w-full max-w-xs object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex w-full flex-col gap-5 md:w-1/2">
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-semibold tracking-[0.2em] text-gray-300 dark:text-gray-600">
                  {feature.number}
                </span>
                <span className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                  {feature.label}
                </span>
              </div>

              <h3 className="text-3xl leading-tight font-bold tracking-tight text-black md:text-4xl dark:text-white">
                {feature.title}
              </h3>

              <p className="text-base leading-relaxed text-gray-500 md:text-lg dark:text-gray-400">
                {feature.description}
              </p>

              <Link
                href={feature.link.href}
                className="group/link mt-2 inline-flex items-center gap-1 text-sm font-medium text-black transition-opacity hover:opacity-50 dark:text-white"
              >
                {feature.link.text}
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
