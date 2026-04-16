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
        staggerChildren: 0.15,
        delayChildren: 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
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

  const imageVariant = {
    hidden: { opacity: 0, x: 40, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden !pb-0"
      style={{
        background: 'linear-gradient(135deg, #e8e8e6 0%, #f0f0ee 50%, #e4e4e2 100%)',
        minHeight: '100svh',
      }}
    >
      {/* Dark mode background */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 50%, #111111 100%)' }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-6 md:flex-row md:items-center md:px-12 lg:px-20">
        {/* Left — Text */}
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="z-10 flex flex-col gap-6 pt-20 text-center md:w-1/2 md:pt-0 md:pr-8 md:text-left"
        >
          <motion.p
            variants={item}
            className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase"
          >
            FilmRAID · Professional Storage
          </motion.p>

          <motion.h1
            variants={item}
            className="text-5xl leading-[1.05] font-bold tracking-tight text-black sm:text-6xl lg:text-7xl dark:text-white"
          >
            Professional
            <span className="block">RAID Storage</span>
            <span className="block">for Film.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg font-normal text-gray-500 dark:text-gray-400"
          >
            Complete & Ready to Use.
          </motion.p>

          <motion.p
            variants={item}
            className="max-w-sm text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400"
          >
            Enterprise SAS drives + Areca controller, pre-configured and shipped across Europe in 3
            days. Built for DITs, editors and post-production professionals.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row"
          >
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

        {/* Right — Product PNG floating */}
        <motion.div
          variants={imageVariant}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="relative mt-8 flex items-center justify-center md:mt-0 md:w-1/2"
        >
          <Image
            src="/layout/hero-product.png"
            alt="FilmRAID Areca professional RAID system"
            width={400}
            height={459}
            priority
            className="h-auto w-full max-w-[200px] object-contain drop-shadow-2xl md:max-w-[400px]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
