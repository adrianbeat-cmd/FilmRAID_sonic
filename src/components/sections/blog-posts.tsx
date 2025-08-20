'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Paperclip } from 'lucide-react';
import { motion as m } from 'motion/react';

import SectionHeader from '../section-header';
import { Card, CardContent, CardHeader } from '../ui/card';

import { useIsMobile } from '@/hooks/useIsMobile';
import { BlogPost } from '@/lib/blog';
import { cn } from '@/lib/utils';

const DEFAULT_HOVERED_CARD_INDEX = 1;

export default function BlogSection({
  blogPosts,
  isBlogsPage,
}: {
  blogPosts: BlogPost[];
  isBlogsPage?: boolean;
}) {
  const isMobile = useIsMobile();
  const [hoveredCardIndex, setHoveredCardIndex] = useState(DEFAULT_HOVERED_CARD_INDEX);

  // Derive whether each card should show hover effects
  const getIsCardHovered = (index: number) => isMobile || hoveredCardIndex === index;

  return (
    <section
      className={cn('section-padding container space-y-10.5', isBlogsPage && 'hero-padding-margin')}
    >
      <SectionHeader
        icon={<Paperclip />}
        category="Blog"
        title="Sound Insights"
        description="Stay updated with the latest trends in audio technology, speaker innovations, and expert tips to enhance your listening experience."
        isCenter={isBlogsPage}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10.5">
        {blogPosts.map((blog, index) => {
          const isHovered = getIsCardHovered(index);

          return (
            <Card
              key={index}
              className={cn(
                'group cursor-pointer gap-0 overflow-hidden p-0 transition-all',
                !isHovered && 'border-transparent bg-transparent shadow-none',
              )}
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseLeave={() => setHoveredCardIndex(DEFAULT_HOVERED_CARD_INDEX)}
            >
              <Link href={`/blog/${blog.slug}`}>
                <CardHeader className="relative h-[320px] overflow-hidden rounded-3xl">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover transition-all duration-300"
                  />
                </CardHeader>
                <CardContent className="px-0 py-6">
                  <m.div
                    initial={false}
                    animate={{
                      x: isHovered ? 'calc(var(--spacing) * 6)' : 0,
                    }}
                    className="space-y-2.5"
                  >
                    <h3 className="text-2xl">{blog.title}</h3>
                    <p>
                      {new Date(blog.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </m.div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
