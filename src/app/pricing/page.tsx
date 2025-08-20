'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { DollarSign, ChevronRight } from 'lucide-react';
import { motion as m } from 'motion/react';

import AnimatedBorderButton from '@/components/animated-border-button';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import productsData from '@/data/products.json';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const DEFAULT_HOVERED_CARD_INDEX = 1;

export default function PricingSection() {
  const { products: _productsData } = productsData;
  const products = _productsData.slice(0, 3);

  const isMobile = useIsMobile();
  const [hoveredCardIndex, setHoveredCardIndex] = useState(DEFAULT_HOVERED_CARD_INDEX);

  // Derive whether each card should show hover effects
  const getIsCardHovered = (index: number) => isMobile || hoveredCardIndex === index;

  return (
    <section className={cn('hero-padding-margin container space-y-10.5')}>
      <SectionHeader
        icon={<DollarSign />}
        category="Pricing"
        title="Simple Pricing, Exceptional Value"
        description="We believe great sound shouldn't come with hidden costs or confusing plans."
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10.5">
        {products.map((product, index) => {
          const isHovered = getIsCardHovered(index);

          return (
            <Link key={product.id} href="#" className="group block">
              <Card
                className={cn(
                  'cursor-pointer gap-0 overflow-hidden py-0 shadow-none transition-all',
                  !isHovered && 'border-transparent bg-transparent',
                )}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(DEFAULT_HOVERED_CARD_INDEX)}
              >
                <div className="bg-card mb-4 rounded-3xl pt-8 pb-4">
                  <CardHeader className="relative h-[310px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain transition-all duration-300 group-hover:scale-105"
                    />
                    <m.div
                      initial={false}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 30,
                      }}
                      className="absolute inset-x-7 bottom-0 z-10 hidden md:block"
                    >
                      <AnimatedBorderButton>
                        Buy now
                        <ChevronRight className="transition-transform delay-75 group-hover:translate-x-0.5" />
                      </AnimatedBorderButton>
                    </m.div>
                  </CardHeader>
                </div>

                <CardContent className={cn('px-0 pt-6 pb-6 md:pt-0')}>
                  <m.div
                    initial={false}
                    animate={{
                      x: isHovered ? 'calc(var(--spacing) * 6)' : 0,
                    }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center gap-1">
                      <span>${product.price}</span>
                      {product.originalPrice && (
                        <span className="line-through opacity-50">${product.originalPrice}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold">{product.name}</h3>
                    <p>{product.description}</p>
                  </m.div>
                  <Button
                    variant="default"
                    size="lg"
                    className="mx-auto mt-4 flex w-[calc(100%-calc(var(--spacing)*6*2))] rounded-full md:hidden"
                  >
                    Buy now
                    <ChevronRight className="transition-transform delay-75 group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
