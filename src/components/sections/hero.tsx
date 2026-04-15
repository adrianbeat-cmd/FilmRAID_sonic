'use client';
import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

const Hero = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 20,
      },
    },
  };

  return (
    <section
      className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden bg-[#f0f0ee] !pb-0 dark:bg-[#111111]"
      style={{ minHeight: '100svh' }}
    >
      {/* Product image — right side on desktop, full background on mobile */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full md:right-0 md:left-auto md:w-[58%]"
      >
        <Image
          src="/layout/hero-product.jpg"
          alt="FilmRAID Areca RAID system"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Fade to left on desktop */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[#f0f0ee] via-[#f0f0ee]/70 to-transparent md:block dark:from-[#111111] dark:via-[#111111]/70" />
        {/* Fade from bottom on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0f0ee] via-[#f0f0ee]/60 to-[#f0f0ee]/10 md:hidden dark:from-[#111111] dark:via-[#111111]/60 dark:to-[#111111]/10" />
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-16 md:justify-center md:px-16 md:pb-0 lg:px-24">
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="flex max-w-xl flex-col gap-7"
        >
          {/* Title */}
          <motion.h1
            variants={item}
            className="text-4xl leading-tight font-bold tracking-tight text-black sm:text-5xl lg:text-6xl dark:text-white"
          >
            Professional RAID
            <span className="block">Storage for Film</span>
            <span className="mt-1 block text-2xl font-normal text-gray-500 sm:text-3xl lg:text-4xl dark:text-gray-400">
              Complete & Ready to Use
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="max-w-sm text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400"
          >
            Enterprise SAS drives + Areca controller, pre-configured and shipped across Europe in 3
            days. Built for DITs, editors and post-production professionals.
          </motion.p>

          {/* CTA */}
          <motion.div variants={item}>
            <AnimatedBorderButton
              asChild
              className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
            >
              <Link href="/configs">
                See Models & Prices <ChevronRight />
              </Link>
            </AnimatedBorderButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
