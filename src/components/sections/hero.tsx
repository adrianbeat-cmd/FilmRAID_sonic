'use client';
import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';

import { useIsMobile } from '@/hooks/useIsMobile';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

const Hero = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();

  const productY = useTransform(scrollY, [0, 800], [0, isMobile ? 160 : 224]);
  const imageScale = useTransform(scrollY, [0, 800], [1, 1.125]);

  useEffect(() => {
    const updateScrollState = () => {
      if (window.scrollY > 5 && !isScrolling) {
        setIsScrolling(true);
      }
    };
    window.addEventListener('scroll', updateScrollState);
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [isScrolling]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.15,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -30, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20,
      },
    },
  };

  const imageAnimation = {
    hidden: { opacity: 0, y: 80, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 20,
      },
    },
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsScrolling(true);
    }
  }, [prefersReducedMotion]);

  return (
    <section className="relative -mx-[calc(50vw-50%)] h-[calc(100vw/0.78)] max-h-screen w-screen overflow-hidden bg-transparent !pb-0 text-center md:h-screen dark:bg-transparent">
      {/* Light mode background */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center dark:hidden"
        style={{ backgroundImage: 'url("/layout/hero_back.jpg")' }}
      />
      {/* Dark mode background */}
      <div
        className="absolute inset-0 hidden h-full w-full bg-cover bg-center dark:block"
        style={{ backgroundImage: 'url("/layout/hero_back_dark.jpg")' }}
      />
      {/* Content wrapper: Using hero-content class and flexible layout */}
      <div className="hero-content relative z-30 container mx-auto flex h-full flex-col items-center gap-8 px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] md:pt-[calc(3rem+env(safe-area-inset-top))]">
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Logo with responsive sizing */}
          <motion.div
            variants={imageAnimation}
            className="relative max-h-[min(40vh,568px)] w-full max-w-[min(80vw,644px)]"
          >
            <Image
              src="/layout/logo.svg"
              alt="FilmRAID Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: 'auto' }}
              priority
              className="h-auto w-full object-contain drop-shadow-2xl dark:hidden"
            />
            <Image
              src="/layout/logo_light.svg"
              alt="FilmRAID Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: 'auto' }}
              priority
              className="hidden h-auto w-full object-contain drop-shadow-2xl dark:block"
            />
          </motion.div>
          <motion.h1
            variants={item}
            className="bg-clip-text text-4xl leading-tight font-bold sm:text-5xl md:text-6xl md:leading-18"
          >
            Fast & Reliable Storage
          </motion.h1>
          <motion.p
            variants={item}
            className="max-w-3xl text-lg leading-7 text-black sm:text-xl sm:leading-8 dark:text-white"
          >
            Custom RAID storage for film productions.
          </motion.p>
          <motion.div variants={item}>
            <AnimatedBorderButton
              asChild
              className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
            >
              <Link href="/configs">
                Configure Now <ChevronRight />
              </Link>
            </AnimatedBorderButton>
          </motion.div>
        </motion.div>
        {/* Main product image */}
        <motion.div
          variants={imageAnimation}
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="absolute bottom-0 left-1/2 max-h-[min(40vh,568px)] w-full max-w-[min(80vw,644px)] -translate-x-1/2 translate-y-[25%] md:mt-7 landscape:translate-y-[5%]"
          style={
            isScrolling
              ? {
                  y: productY,
                  scale: imageScale,
                }
              : {}
          }
        >
          <Image
            src="/layout/main-product.png"
            alt="Main Product"
            width={644}
            height={568}
            priority
            className="h-auto w-full object-contain drop-shadow-2xl dark:hidden"
          />
          <Image
            src="/layout/main-product_dark.png"
            alt="Main Product Dark"
            width={644}
            height={568}
            priority
            className="hidden h-auto w-full object-contain drop-shadow-2xl dark:block"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
