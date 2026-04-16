'use client';
import React, { useEffect, useRef } from 'react';

import { motion, useInView, useAnimation } from 'framer-motion';

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

const stats = [
  {
    value: '5000MB/s',
    label: 'Sustained transfers',
    description: 'On all models, across RAID 0, 5, 6 and 10.',
  },
  {
    value: '72–288TB',
    label: 'Storage range',
    description: 'Drives included, pre-configured and ready to use.',
  },
  {
    value: '3 days',
    label: 'EU delivery',
    description: 'FedEx from Barcelona to anywhere in Europe.',
  },
  {
    value: '3+5 yr',
    label: 'Warranty',
    description: '3yr on Areca enclosure. 5yr on enterprise drives.',
  },
];

const ValueProposition = () => {
  const controls = useAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isInView || prefersReducedMotion) {
      controls.start('visible');
    }
  }, [isInView, controls, prefersReducedMotion]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section ref={sectionRef} className="section-padding container">
      {/* Headline */}
      <div className="mb-0 max-w-2xl border-b border-gray-200 pb-12 dark:border-gray-800">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Why FilmRAID
        </p>
        <h2 className="text-3xl leading-tight font-bold tracking-tight text-black md:text-4xl lg:text-5xl dark:text-white">
          Built for professionals
          <span className="block font-normal text-gray-400">who can't afford to lose a frame.</span>
        </h2>
      </div>

      {/* Stats grid — no boxes, just dividers */}
      <motion.div
        variants={container}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate={controls}
        className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 dark:divide-gray-800"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.value}
            variants={item}
            className="flex flex-col gap-2 py-8 sm:px-8 sm:py-0 first:sm:pl-0 last:sm:pr-0"
          >
            <p className="text-4xl font-bold tracking-tight text-black md:text-5xl dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm font-semibold text-black dark:text-white">{stat.label}</p>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default ValueProposition;
