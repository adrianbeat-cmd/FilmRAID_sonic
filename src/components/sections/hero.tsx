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
    hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
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
    hidden: { opacity: 0, scale: 1.03 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      className="relative -mx-[calc(50vw-50%)] w-screen overflow-hidden !pb-0"
      style={{ background: 'linear-gradient(160deg, #d8d8d8 0%, #e8e8e8 40%, #f2f2f0 100%)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-10 md:px-12">
        {/* Small label — like Apple's "AirPods Pro 3" */}
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.p
            variants={item}
            className="text-sm font-medium tracking-widest text-gray-500 uppercase"
          >
            FilmRAID Pro Storage
          </motion.p>

          {/* Main headline */}
          <motion.h1
            variants={item}
            className="text-4xl leading-tight font-bold tracking-tight text-black sm:text-5xl lg:text-6xl"
          >
            Professional RAID for Film.
            <span className="mt-2 block text-2xl font-normal text-gray-500 sm:text-3xl lg:text-4xl">
              Complete & Ready to Use.
            </span>
          </motion.h1>
        </motion.div>

        {/* Product image — large, centered, no cropping */}
        <motion.div
          variants={imageVariant}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="relative mt-6 w-full max-w-3xl"
        >
          <Image
            src="/layout/hero-product.jpg"
            alt="FilmRAID Areca RAID system"
            width={1706}
            height={1088}
            priority
            className="h-auto w-full object-contain"
          />
        </motion.div>

        {/* Text + CTA below image — like Apple bottom row */}
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="flex w-full flex-col items-center gap-4 pb-14 text-center md:flex-row md:items-end md:justify-between md:pb-16"
        >
          <motion.p
            variants={item}
            className="max-w-sm text-sm leading-relaxed text-gray-600 md:text-left md:text-base"
          >
            Enterprise SAS drives + Areca controller, pre-configured and shipped across Europe in 3
            days. Built for DITs, editors and post-production professionals.
          </motion.p>

          <motion.div variants={item} className="flex items-center gap-4">
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
