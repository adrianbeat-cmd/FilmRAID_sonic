'use client';
import React from 'react';

import Image from 'next/image';

import { CircleCheck, Diamond, Star } from 'lucide-react';

import SectionHeader from '@/components/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TestimonialProps {
  rating: number;
  comment: string;
  author: {
    name: string;
    image: string;
    type: string;
  };
}

const testimonials: TestimonialProps[] = [
  {
    rating: 5,
    comment: 'Amazing sound—clear highs and deep bass. Feels like a concert in my living room!',
    author: {
      name: 'Lena M',
      image: '/images/product/testimonials/user-1.webp',
      type: 'Verified buyer',
    },
  },
  {
    rating: 5,
    comment: "Best Bluetooth speaker I've owned. Long battery life and super reliable!",
    author: {
      name: 'Jordan S',
      image: '/images/product/testimonials/user-2.webp',
      type: 'Verified buyer',
    },
  },
  {
    rating: 5,
    comment: 'Looks great, sounds better. I use it daily for both work and fun.',
    author: {
      name: 'Emma W',
      image: '/images/product/testimonials/user-3.webp',
      type: 'Verified buyer',
    },
  },
  {
    rating: 5,
    comment: 'Compact but powerful. Perfect for trips and outdoor hangs.',
    author: {
      name: 'Amelia R',
      image: '/images/product/testimonials/user-4.webp',
      type: 'Verified buyer',
    },
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding container space-y-10.5">
      <SectionHeader
        category="Testimonials"
        title="What Our Customers Are Saying"
        description="From music lovers to daily users, everyone's talking about Sonic. See what they have to say."
        icon={<Diamond />}
      />
      <div className="perspective-1000 grid grid-cols-1 gap-8 md:grid-cols-5">
        {testimonials.map((testimonial, index) => (
          <div key={index} className={cn('col-span-2 md:nth-2:col-span-3 md:nth-3:col-span-3')}>
            <Card className="h-full transform-gpu p-0">
              <CardContent className="flex flex-1 flex-col gap-10.5 p-8">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-xl leading-8">{testimonial.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="relative size-11 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.author.image}
                      alt={testimonial.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{testimonial.author.name}</span>
                    <span className="flex items-center gap-1.5 text-sm">
                      <CircleCheck className="text-background fill-foreground size-5" />
                      {testimonial.author.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
