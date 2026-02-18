'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { products } from '@/data/products';

export default function CatalogPage() {
  return (
    <section className="section-padding container py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Our FilmRAID Models</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Professional RAID systems built for filmmakers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.flatMap((model) =>
          model.variants.map((variant) => (
            <Card key={variant.slug} className="group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={model.image}
                  alt={model.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">
                  {model.name} — {variant.totalTB}TB
                </h3>

                <p className="text-muted-foreground mt-2 text-sm">
                  RAID 0: {variant.raid0TB}TB | RAID 5: {variant.raid5TB}TB
                </p>

                <p className="mt-4 text-2xl font-bold">€{variant.priceEUR}</p>

                <Button asChild className="mt-6 w-full">
                  <Link href={`/products/${variant.slug}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          )),
        )}
      </div>
    </section>
  );
}
