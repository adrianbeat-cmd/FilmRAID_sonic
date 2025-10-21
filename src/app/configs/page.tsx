'use client';
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Force redeploy to revert to 22TB capacity and update warranty - Oct 20, 2025
const modelData = [
  {
    name: 'FilmRaid-4A',
    hddCount: 4,
    image: '/layout/filmraid-4a.jpg',
    back_image: '/layout/FilmRaid-4A_back.jpg',
    description: (
      <>
        4-bay <span className="font-bold">portable tower RAID system</span> with dual Thunderbolt 3
        ports for <span className="font-bold">up to 40Gb/s transfers</span>. Supports SAS/SATA
        drives, RAID 0/1/1E/3/5/6/10, DisplayPort, USB-C/USB4 compatibility. Available in 18TB to
        22TB options with enterprise-grade HDDs. Ideal for{' '}
        <span className="font-bold">compact, high-speed film workflows</span>. All FilmRAID systems
        come with a limited factory warranty covering hardware defects, with expert support for
        warranty claims.
      </>
    ),
    specs: [
      { label: 'Bays', value: '4 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 3',
          'DisplayPort',
          'RJ45 Ethernet',
          'USB-C',
          'USB-A',
          '3.5mm audio',
        ],
      },
      { label: 'RAID Levels', value: '0, 1, 1E, 3, 5, 6, 10, JBOD' },
      { label: 'Speed', value: 'Up to 2600MB/s read/write' },
      { label: 'Dimensions', value: '123 x 165.6 x 232 mm' },
      { label: 'Weight', value: '3.6 Kg diskless' },
      { label: 'Power', value: '150W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
      {
        label: 'OS Support',
        value: 'Thunderbolt 3: macOS 10.12 or later & Windows 8/10 or later; USB: OS Independent',
      },
    ],
  },
  {
    name: 'FilmRaid-6',
    hddCount: 6,
    image: '/layout/filmraid-6.jpg',
    back_image: '/layout/FilmRaid-6_back.jpg',
    description: (
      <>
        6-bay <span className="font-bold">desktop RAID system</span> with dual core processor and
        2GB DDR3 ECC memory. Supports 4K/6K/8K workflows, RAID 0/1/1E/3/5/6/10/30/50/60, low-noise
        fan, USB-C/USB4 compatibility. Available in 18TB to 22TB options with enterprise-grade HDDs.
        Perfect for <span className="font-bold">professional post-production setups</span>. All
        FilmRAID systems come with a limited factory warranty covering hardware defects, with expert
        support for warranty claims.
      </>
    ),
    specs: [
      { label: 'Bays', value: '6 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 3',
          'DisplayPort',
          'RJ45 Ethernet',
          'USB-C',
          'USB-A',
          '3.5mm audio',
        ],
      },
      { label: 'RAID Levels', value: '0, 1, 1E, 3, 5, 6, 10, 30, 50, 60, JBOD' },
      { label: 'Speed', value: 'Up to 2600MB/s read/write' },
      { label: 'Processor', value: 'Dual core' },
      { label: 'Memory', value: '2GB DDR3 ECC' },
      { label: 'Dimensions', value: '146 x 255 x 290 mm' },
      { label: 'Weight', value: '4.8 Kg diskless' },
      { label: 'Power', value: '180W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
      {
        label: 'OS Support',
        value: 'Thunderbolt 3: macOS 10.12 or later & Windows 8/10 or later; USB: OS Independent',
      },
    ],
  },
  {
    name: 'FilmRaid-8',
    hddCount: 8,
    image: '/layout/filmraid-8.jpg',
    back_image: '/layout/FilmRaid-8_back.jpg',
    description: (
      <>
        8-bay <span className="font-bold">tower RAID system</span> with dual core processor and 2GB
        DDR3 ECC memory. Thunderbolt 3 up to 40Gb/s, DisplayPort 1.4 for 8K 30Hz, RAID
        0/1/1E/3/5/6/10/30/50/60, USB-C/USB4 compatibility. Available in 18TB to 22TB options with
        enterprise-grade HDDs. Designed for{' '}
        <span className="font-bold">high-capacity cinema storage</span>. All FilmRAID systems come
        with a limited factory warranty covering hardware defects, with expert support for warranty
        claims.
      </>
    ),
    specs: [
      { label: 'Bays', value: '8 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 3',
          'DisplayPort',
          'RJ45 Ethernet',
          'USB-C',
          'USB-A',
          '3.5mm audio',
        ],
      },
      { label: 'RAID Levels', value: '0, 1, 1E, 3, 5, 6, 10, 30, 50, 60, JBOD' },
      { label: 'Speed', value: 'Up to 2600MB/s read/write' },
      { label: 'Processor', value: 'Dual core' },
      { label: 'Memory', value: '2GB DDR3 ECC' },
      { label: 'Dimensions', value: '146 x 302 x 290 mm' },
      { label: 'Weight', value: '6.9 Kg diskless' },
      { label: 'Power', value: '270W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
      {
        label: 'OS Support',
        value: 'Thunderbolt 3: macOS 10.12 or later & Windows 8/10 or later; USB: OS Independent',
      },
    ],
  },
  {
    name: 'FilmRaid-12E',
    hddCount: 12,
    image: '/layout/filmraid-12e.jpg',
    back_image: '/layout/FilmRaid-12E_back.jpg',
    description: (
      <>
        12-bay <span className="font-bold">expandable RAID system</span> with dual core 1.6GHz
        processor and 8GB DDR4 ECC memory. Supports 4K/6K/8K/VR, RAID 0/1/1E/3/5/6/10/30/50/60,
        removable bays, USB-C/USB4 compatibility. Available in 18TB to 22TB options with
        enterprise-grade HDDs. Ultimate for{' '}
        <span className="font-bold">large-scale film projects</span>. All FilmRAID systems come with
        a limited factory warranty covering hardware defects, with expert support for warranty
        claims.
      </>
    ),
    specs: [
      { label: 'Bays', value: '12 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 3',
          'DisplayPort',
          'RJ45 Ethernet',
          'USB-C',
          'USB-A',
          '3.5mm audio',
        ],
      },
      { label: 'RAID Levels', value: '0, 1, 1E, 3, 5, 6, 10, 30, 50, 60, JBOD' },
      { label: 'Speed', value: 'Up to 2600MB/s read/write' },
      { label: 'Processor', value: 'Dual core 1.6GHz' },
      { label: 'Memory', value: '8GB DDR4 ECC' },
      { label: 'Dimensions', value: '206 x 310 x 290 mm' },
      { label: 'Weight', value: '8.9 Kg diskless' },
      { label: 'Power', value: '400W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
      {
        label: 'OS Support',
        value: 'Thunderbolt 3: macOS 10.12 or later & Windows 8/10 or later; USB: OS Independent',
      },
    ],
  },
];

// Capacity options
const capacityOptions = [
  {
    tb: 18,
    raid0: (hdd: number) => hdd * 18,
    raid5: (hdd: number) => (hdd - 1) * 18,
    prices: [2949, 4279, 5239, 7589],
  },
  {
    tb: 20,
    raid0: (hdd: number) => hdd * 20,
    raid5: (hdd: number) => (hdd - 1) * 20,
    prices: [3129, 4549, 5599, 8129],
  },
  {
    tb: 22,
    raid0: (hdd: number) => hdd * 22,
    raid5: (hdd: number) => (hdd - 1) * 22,
    prices: [3219, 4679, 5779, 8399],
  },
];

const ConfigsPage = () => {
  const [selectedModel, setSelectedModel] = useState(0);
  const [selectedCapacity, setSelectedCapacity] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  const currentModel = modelData[selectedModel];
  const currentCapacity = capacityOptions[selectedCapacity];
  const hdd = currentModel.hddCount;
  const raid0 = currentCapacity.raid0(hdd);
  const price = currentCapacity.prices[selectedModel];

  const images = [currentModel.image, currentModel.back_image];

  const getIncrement = (optionPrice: number) => {
    const diff = optionPrice - capacityOptions[selectedCapacity].prices[selectedModel];
    if (diff === 0) return 'Base';
    return diff > 0 ? `+€${diff}` : `-€${Math.abs(diff)}`;
  };

  return (
    <section className="section-padding container">
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-8">
        {/* IMAGES — mobile first */}
        <div className="order-1 md:sticky md:top-0 md:order-none md:col-start-1 md:row-start-1">
          <h2 className="mb-4 text-left text-3xl font-bold text-black md:text-right dark:text-white">
            {currentModel.name}
          </h2>
          <Image
            src={images[selectedImage]}
            alt={currentModel.name + (selectedImage === 0 ? '' : ' back')}
            width={600}
            height={600}
            className="mb-4 rounded-lg"
          />
          <div className="mb-4 flex justify-center gap-2">
            {images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={currentModel.name + (index === 0 ? '' : ' back') + ' thumbnail'}
                width={100}
                height={100}
                className="cursor-pointer rounded"
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* CONFIGURATOR — sits under images on mobile */}
        <div className="order-2 md:order-none md:col-start-2 md:row-start-1">
          <h2 className="mb-8 text-left text-3xl font-bold text-black dark:text-white">
            Customize your FilmRaid
          </h2>
          <Tabs
            defaultValue="FilmRaid-4A"
            onValueChange={(value) =>
              setSelectedModel(modelData.findIndex((m) => m.name === value))
            }
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="FilmRaid-4A">4A</TabsTrigger>
              <TabsTrigger value="FilmRaid-6">6</TabsTrigger>
              <TabsTrigger value="FilmRaid-8">8</TabsTrigger>
              <TabsTrigger value="FilmRaid-12E">12E</TabsTrigger>
            </TabsList>
          </Tabs>
          <h3 className="mt-8 text-2xl font-bold text-black dark:text-white">Storage</h3>
          <RadioGroup
            className="mt-4 space-y-4"
            value={selectedCapacity.toString()}
            onValueChange={(value) => setSelectedCapacity(parseInt(value))}
          >
            {capacityOptions.map((opt, index) => (
              <div
                key={index}
                className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4"
              >
                <RadioGroupItem value={index.toString()} id={`capacity-${index}`} />
                <Label htmlFor={`capacity-${index}`} className="flex-grow cursor-pointer">
                  {opt.raid0(hdd)}TB ({opt.tb}TB HDD)
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    RAID 0: {opt.raid0(hdd)}TB | RAID 5: {opt.raid5(hdd)}TB
                  </p>
                </Label>
                <p className="text-primary ml-auto">{getIncrement(opt.prices[selectedModel])}</p>
              </div>
            ))}
          </RadioGroup>
          <p className="mt-8 text-2xl font-bold text-black dark:text-white">Total: €{price}</p>
          <Button className="mt-4 w-full" asChild>
            <Link href={`/products/${currentModel.name.toLowerCase()}-${raid0}tb`}>
              Go to Product Page
            </Link>
          </Button>
        </div>

        {/* DESCRIPTION — after configurator on mobile */}
        <div className="order-3 flex flex-col gap-4 md:order-none md:col-start-1 md:row-start-2">
          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-bold text-black dark:text-white">Overview</h3>
              <p className="text-gray-600 dark:text-gray-300">{currentModel.description}</p>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800">
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
                Technical Specifications
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                {currentModel.specs.map((spec, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="font-semibold">{spec.label}</span>
                    <span className="text-right">
                      {Array.isArray(spec.value)
                        ? spec.value.map((line, i) => <div key={i}>{line}</div>)
                        : spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ConfigsPage;
