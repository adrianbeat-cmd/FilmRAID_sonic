'use client';
import React from 'react';

import Image from 'next/image';

import { Package } from 'lucide-react';
import { motion } from 'motion/react';

import { Card } from '../ui/card';

import SectionHeader from '@/components/section-header';

export default function ProductIntro() {
  // Letter animation variants
  const letterContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4,
      },
    },
  };

  const letter = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const SONIC_TEXT = 'SONIC';

  return (
    <section className="section-padding container space-y-10.5">
      <SectionHeader
        category="Product"
        title="Proven by People, Designed to Perform"
        description="Backed by a global community of users, our speakers combine cutting-edge tech with sleek design—made to stand out."
        icon={<Package className="h-4 w-4" />}
      />
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative h-[320px] overflow-hidden rounded-3xl md:h-[460px] md:flex-1/3">
          <Image
            src="/images/products/product-4.webp"
            alt="Sonic Product"
            fill
            className="object-cover"
          />
        </div>

        <Card className="flex min-h-[320px] items-center justify-center border-none md:flex-2/3">
          <motion.div
            className="flex"
            variants={letterContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.75 }}
          >
            {SONIC_TEXT.split('').map((char, index) => (
              <motion.span
                key={index}
                variants={letter}
                className="inline-block text-6xl font-medium"
                style={{
                  transformOrigin: '50% 100%',
                  display: 'inline-block',
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        </Card>
      </div>
    </section>
  );
}
