'use client';

import { useState, useEffect, useCallback } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';

const IMAGES = [
  {
    src: '/layout/raid1.jpg',
    alt: 'FilmRAID tower in post-production setup',
  },
  {
    src: '/layout/raid2.jpg',
    alt: 'Custom RAID assembly process',
  },
  {
    src: '/layout/raid3.jpg',
    alt: 'RAID system on film set for fast transfers',
  },
];

export default function InReality() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === active) return;
      setFading(true);
      setTimeout(() => {
        setActive(index);
        setFading(false);
      }, 400);
    },
    [active],
  );

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((active + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [active, goTo]);

  return (
    <section className="section-padding container space-y-8">
      {/* Section header — minimal */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">In Reality</p>
        <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl dark:text-white">
          FilmRAID in Action
        </h2>
        <p className="max-w-xl text-base text-gray-500 dark:text-gray-400">
          Our RAID systems integrate seamlessly into film production workflows — on set, in the edit
          suite, and in post.
        </p>
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black">
        <Image
          src={IMAGES[active].src}
          alt={IMAGES[active].alt}
          fill
          className={cn(
            'object-cover transition-opacity duration-500',
            fading ? 'opacity-0' : 'opacity-100',
          )}
          priority
        />
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-3">
        {IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to image ${idx + 1}`}
            className={cn(
              'rounded-full transition-all duration-300',
              idx === active
                ? 'h-2 w-8 bg-black dark:bg-white'
                : 'h-2 w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500',
            )}
          />
        ))}
      </div>
    </section>
  );
}
