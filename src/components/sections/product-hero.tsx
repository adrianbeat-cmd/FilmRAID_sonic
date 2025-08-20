'use client';
import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

import { Button } from '@/components/ui/button';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

export default function ProductHero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const { scrollY } = useScroll();

  // Scroll-based animations
  const imageScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const textY = useTransform(scrollY, [0, 400], [0, 180]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Update isScrolling state when user scrolls
  useEffect(() => {
    const updateScrollState = () => {
      if (window.scrollY > 5 && !isScrolling) {
        setIsScrolling(true);
      }
    };

    window.addEventListener('scroll', updateScrollState);
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [isScrolling]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
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

  return (
    <section className="relative flex min-h-[660px] w-full items-end overflow-hidden pb-8 2xl:min-h-[800px]">
      <motion.div className="absolute inset-0" style={isScrolling ? { scale: imageScale } : {}}>
        <Image
          src="/images/blog/blog-5.webp"
          alt="Sonic Product"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="dark:from-background from-base-dark absolute inset-0 bg-linear-to-t to-transparent to-60%" />
      <motion.div
        className="relative z-10 container"
        variants={container}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
        style={isScrolling ? { y: textY } : {}}
      >
        <motion.h2
          variants={item}
          className="text-background dark:text-foreground text-5xl font-bold md:text-6xl"
        >
          Redefining Portable Audio
        </motion.h2>
        <motion.p
          variants={item}
          style={isScrolling ? { opacity } : {}}
          className="text-background dark:text-foreground my-8 max-w-3xl text-xl leading-8"
        >
          Engineered for those who demand more from their audio, this speaker delivers bold sound in
          a sleek, rugged form—ready for any setting.
        </motion.p>
        <motion.div variants={item} style={isScrolling ? { opacity } : {}}>
          <Button
            variant="outline"
            size="lg"
            className="group dark:text-background dark:bg-foreground rounded-full"
            asChild
          >
            <Link href="/pricing">
              Buy now
              <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
