'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import Image from 'next/image';

import { HardDrive } from 'lucide-react';

import SectionHeader from '@/components/section-header';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const SPACING = {
  itemPadding: 4, // py-1 = 8px total
} as const;

type ThumbnailSize = {
  width: number;
  height: number;
  containerWidth: number;
};

// Thumbnail size configurations
const THUMBNAIL_SIZES: Record<'default' | 'hover' | 'distance1' | 'distance2', ThumbnailSize> = {
  default: {
    width: 70,
    height: 44,
    containerWidth: 86,
  },
  hover: {
    width: 86,
    height: 53,
    containerWidth: 86,
  },
  distance1: {
    width: 78,
    height: 49,
    containerWidth: 86,
  },
  distance2: {
    width: 74,
    height: 46,
    containerWidth: 86,
  },
} as const;

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
  const [api, setApi] = useState<CarouselApi>();
  const [activeImage, setActiveImage] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const onSelect = useCallback(() => {
    if (!api) return;
    setActiveImage(api.selectedScrollSnap());
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  // Calculate position for border based on hover index
  const calculateBorderPosition = useCallback(
    (hoverIndex: number | null) => {
      const targetIndex = hoverIndex ?? activeImage;
      let position = 0;

      // Calculate position by summing up the heights of previous items
      for (let i = 0; i < targetIndex; i++) {
        if (hoverIndex !== null) {
          const distanceFromHover = Math.abs(i - hoverIndex);
          if (distanceFromHover === 0) {
            position += THUMBNAIL_SIZES.hover.height;
          } else if (distanceFromHover === 1) {
            position += THUMBNAIL_SIZES.distance1.height;
          } else if (distanceFromHover === 2) {
            position += THUMBNAIL_SIZES.distance2.height;
          } else {
            position += THUMBNAIL_SIZES.default.height;
          }
        } else {
          position += THUMBNAIL_SIZES.default.height;
        }
        position += SPACING.itemPadding * 2; // *2 because of the padding on the top and bottom
      }

      if (hoverIndex !== null) {
        position += SPACING.itemPadding;
      }

      return position;
    },
    [activeImage],
  );

  // Sync the carousel with the navigation
  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  // Add resize listener to update position when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (hoverIndex !== null) {
        // Force a recalculation by toggling the hover state
        const currentHover = hoverIndex;
        setHoverIndex(null);
        setTimeout(() => setHoverIndex(currentHover), 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoverIndex]);

  return (
    <section className="section-padding container space-y-10.5">
      <SectionHeader
        category="In Reality"
        title="FilmRAID in Action"
        description="Discover how our custom RAID systems integrate seamlessly into film production workflows, providing secure storage and lightning-fast transfers."
        icon={<HardDrive />}
      />

      <div className="relative overflow-hidden rounded-3xl">
        {/* Main Carousel */}
        <Carousel
          setApi={setApi}
          className="w-full"
          orientation="vertical"
          opts={{
            align: 'start',
            axis: 'y',
          }}
        >
          <CarouselContent className="mt-0 h-[340px] sm:h-[520px] lg:h-[680px]">
            {IMAGES.map((image, index) => (
              <CarouselItem key={index} className="relative h-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover object-bottom"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Thumbnail Navigation */}
        <div className="from-base-dark/60 dark:from-background/60 pointer-events-none absolute inset-0 w-1/3 bg-gradient-to-r to-transparent" />
        <div ref={navRef} className="absolute top-1/2 flex -translate-y-1/2 flex-col ps-2 md:ps-8">
          {IMAGES.map((image, index) => {
            const distance = hoverIndex !== null ? Math.abs(index - hoverIndex) : null;

            let size = THUMBNAIL_SIZES.default;
            if (distance === 0) {
              size = THUMBNAIL_SIZES.hover;
            } else if (distance === 1) {
              size = THUMBNAIL_SIZES.distance1;
            } else if (distance === 2) {
              size = THUMBNAIL_SIZES.distance2;
            }

            return (
              <div
                key={index}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
                style={
                  {
                    '--thumb-width': `${size.width}px`,
                    '--thumb-height': `${size.height}px`,
                    '--container-width': `${size.containerWidth}px`,
                    '--item-padding': `${SPACING.itemPadding}px`,
                  } as React.CSSProperties
                }
                className="flex w-[var(--container-width)] items-center justify-center py-[var(--item-padding)]"
              >
                <button
                  onClick={() => scrollTo(index)}
                  className={cn(
                    'relative origin-center transform-gpu cursor-pointer overflow-visible will-change-[width,height]',
                    'transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]',
                    'h-[var(--thumb-height)] w-[var(--thumb-width)]',
                  )}
                >
                  <div className="absolute inset-1 overflow-hidden rounded-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="rounded-full object-cover object-bottom"
                    />
                  </div>
                </button>
              </div>
            );
          })}
          <div
            style={
              {
                '--highlight-translate-y': `${calculateBorderPosition(hoverIndex)}px`,
              } as React.CSSProperties
            }
            className={cn(
              'border-background pointer-events-none absolute z-20 rounded-full border',
              'transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]',
              'transform-gpu will-change-[width,height,transform]',
              'translate-y-[var(--highlight-translate-y)]',
              hoverIndex === null
                ? [
                    'top-1',
                    'left-4 md:left-10',
                    'h-11 w-[70px]', // default height and width
                  ]
                : [
                    'top-0',
                    'left-2 md:left-8',
                    'h-[53px] w-[86px]', // hover height and width
                  ],
            )}
          />
        </div>
      </div>
    </section>
  );
}
