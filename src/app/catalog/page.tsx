'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { products } from '@/data/products';

export default function CatalogPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">FilmRAID Systems</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-xl">
            Professional RAID storage built for film and video professionals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.flatMap((model) =>
            model.variants.map((variant) => (
              <Card
                key={variant.slug}
                className="group overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Bigger image - no cropping */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={model.image}
                    alt={`${model.name} ${variant.totalTB}TB`}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {model.name} — {variant.totalTB}TB
                  </h3>

                  <p className="text-muted-foreground mt-2 text-sm">
                    RAID 0: {variant.raid0TB}TB | RAID 5: {variant.raid5TB}TB
                  </p>

                  <div className="text-primary mt-8 text-4xl font-bold">€{variant.priceEUR}</div>

                  <Button asChild className="mt-8 w-full text-base" size="lg">
                    <Link href={`/products/${variant.slug}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
