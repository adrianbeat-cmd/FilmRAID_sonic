'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { products } from '@/data/products';

const ConfigsPage = () => {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const currentModel = products[selectedModelIndex];
  const currentVariant = currentModel.variants[selectedVariantIndex];

  const images = [currentModel.image, currentModel.back_image];

  return (
    <section className="section-padding container">
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-8">
        {/* Left - Image */}
        <div className="order-1 md:col-start-1">
          <h2 className="mb-4 text-left text-3xl font-bold text-black md:text-right dark:text-white">
            {currentModel.name}
          </h2>
          <Image
            src={images[0]}
            alt={currentModel.name}
            width={600}
            height={600}
            className="mb-4 rounded-lg"
          />
        </div>

        {/* Right - Configurator */}
        <div className="order-2 md:sticky md:top-6 md:col-start-2 md:h-fit">
          <h2 className="mb-8 text-left text-3xl font-bold text-black dark:text-white">
            Customize your FilmRaid
          </h2>

          <Tabs
            defaultValue={currentModel.id}
            onValueChange={(val) => setSelectedModelIndex(products.findIndex((m) => m.id === val))}
          >
            <TabsList className="grid w-full grid-cols-4">
              {products.map((m) => (
                <TabsTrigger key={m.id} value={m.id}>
                  {m.name.replace('FilmRaid-', '')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <h3 className="mt-8 text-2xl font-bold text-black dark:text-white">Capacity</h3>

          <RadioGroup
            className="mt-4 space-y-4"
            value={selectedVariantIndex.toString()}
            onValueChange={(v) => setSelectedVariantIndex(parseInt(v))}
          >
            {currentModel.variants.map((variant, idx) => (
              <div
                key={idx}
                className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4"
              >
                <RadioGroupItem value={idx.toString()} id={`v-${idx}`} />
                <Label htmlFor={`v-${idx}`} className="flex-grow cursor-pointer">
                  {variant.totalTB}TB
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    RAID 0: {variant.raid0TB}TB | RAID 5: {variant.raid5TB}TB
                  </p>
                </Label>
                <p className="text-primary ml-auto">€{variant.priceEUR}</p>
              </div>
            ))}
          </RadioGroup>

          <p className="mt-8 text-2xl font-bold text-black dark:text-white">
            Total: €{currentVariant.priceEUR}
          </p>

          <Button className="mt-4 w-full" asChild>
            <Link href={`/products/${currentVariant.slug}`}>Go to Product Page</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConfigsPage;
