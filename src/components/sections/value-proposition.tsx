'use client';
import React, { useEffect, useRef } from 'react';

import { motion, useInView, useAnimation } from 'framer-motion';

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

interface ContentItem {
  type: 'text';
  content: string;
  index: number;
}

const CONTENT_ITEMS: ContentItem[] = [
  { type: 'text', content: 'Unlock Seamless', index: 0 },
  { type: 'text', content: 'Storage for Your', index: 1 },
  { type: 'text', content: 'Film Projects', index: 2 },
];

const ValueProposition = () => {
  const controls = useAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.7 });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isInView || prefersReducedMotion) {
      controls.start('visible');
    }
  }, [isInView, controls, prefersReducedMotion]);

  const variants = {
    text: {
      hidden: {
        opacity: 0,
        y: 10,
        filter: 'blur(8px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    },
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
          ease: 'easeOut',
          duration: 0.8,
        },
      },
    },
  };

  return (
    <section ref={sectionRef} className="bg-card py-15 md:py-20 lg:py-36">
      <div className="container flex flex-col items-center justify-center text-center">
        <motion.h2
          className="text-2xl font-bold md:text-3xl lg:text-5xl"
          variants={variants.container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate={controls}
        >
          {CONTENT_ITEMS.map((item, idx) => (
            <motion.span
              key={`feature-${idx}`}
              className="m-1.5 inline-block md:m-4"
              variants={variants.text}
            >
              {item.content}
            </motion.span>
          ))}
        </motion.h2>
        <p className="mb-12 text-center text-lg">
          FilmRAID delivers pre-configured RAID systems tailored for digital cinema and
          post-production. With 3-day EU delivery, dual Thunderbolt 3 ports, and enterprise-grade
          SAS drives, focus on creating — not managing data.
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Speed & Reliability
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              RAID 0 to RAID 6 setups with sustained transfers up to 2600MB/s — perfect for 4K,
              6K, and 8K workflows. Available from 72TB to 288TB with enterprise-grade SAS drives.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Order today, pre-configured and shipped across Europe via FedEx in 3 days — no
              assembly required, ready to plug in and use.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Reliable Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All FilmRAID systems come with a 3-year warranty on the Areca enclosure and up to
              5-year warranty on the drives. Expert support included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
