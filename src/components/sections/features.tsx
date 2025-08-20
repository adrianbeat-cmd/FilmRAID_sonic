import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { HardDrive, Zap, Shield, ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';

interface Feature {
  icon: React.ReactElement;
  label: string;
  title: string;
  description: string;
  image: string;
  link: {
    text: string;
    href: string;
  };
}

const features: Feature[] = [
  {
    icon: <Zap />,
    label: 'Speed & Reliability',
    title: 'Blazing-fast transfers up to 3000MB/s for 8K workflows.',
    description:
      'Our RAID systems are designed to handle high-speed data transfers, ensuring smooth post-production without bottlenecks.',
    image: '/layout/feature-1.png',
    link: {
      text: 'Configure now',
      href: '/configs',
    },
  },
  {
    icon: <HardDrive />,
    label: 'High-Capacity Storage',
    title: '18TB to 22TB options with enterprise-grade HDDs.',
    description:
      'Store massive film files securely with customizable RAID levels for redundancy and performance.',
    image: '/layout/feature-2.png',
    link: {
      text: 'See configs',
      href: '/configs',
    },
  },
  {
    icon: <Shield />,
    label: 'Secure & Versatile',
    title: 'Robust security and versatile interfaces like Thunderbolt and PCIe.',
    description:
      'Built for cinema experts, with no-stock model for 2-day EU delivery and AI-assisted configs.',
    image: '/layout/feature-3.png',
    link: {
      text: 'Learn more',
      href: '/about',
    },
  },
];

const Features = () => {
  return (
    <section className="section-padding container">
      <div className="[&>*:nth-child(odd)]:md:flex-row-reverse">
        {features.map((feature, index) => (
          <div
            key={index}
            className="section-padding flex flex-col items-center justify-between gap-8 last:!pb-0 md:flex-row md:gap-16"
          >
            <div className="relative h-[340px] w-full sm:h-[600px] sm:min-w-[440px] lg:w-[569px] lg:shrink-0">
              <Image
                src={feature.image}
                alt={feature.label}
                fill
                className="rounded-3xl object-cover object-[70%_30%]"
              />
            </div>
            <div className="rounded-3xl bg-white p-6 dark:bg-gray-800">
              <div className="space-y-6 md:space-y-8 lg:space-y-10.5">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <p className="text-xl leading-8 text-black md:leading-10 dark:text-white">
                    {feature.label}
                  </p>
                </div>
                <h3 className="text-2xl font-medium text-black md:text-3xl lg:text-4xl dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xl leading-8 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
              <AnimatedBorderButton
                asChild
                wrapperClassName="w-fit mt-4"
                className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
              >
                <Link href={feature.link.href}>
                  {feature.link.text} <ChevronRight />
                </Link>
              </AnimatedBorderButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
