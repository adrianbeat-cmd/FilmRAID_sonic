// src/data/products.ts
// SINGLE SOURCE OF TRUTH — only edit this file when prices change

export type ProductVariant = {
  slug: string;
  totalTB: number;
  perDriveTB: number;
  priceEUR: number;
  raid0TB: number;
  raid5TB: number;
};

export type ProductModel = {
  id: string;
  name: string;
  hddCount: number;
  image: string;
  back_image: string;
  description: string;
  specs: Array<{ label: string; value: string | string[] }>;
  variants: ProductVariant[];
};

export const products: ProductModel[] = [
  {
    id: 'filmraid-4a',
    name: 'FilmRaid-4A',
    hddCount: 4,
    image: '/layout/filmraid-4a.jpg',
    back_image: '/layout/FilmRaid-4A_back.jpg',
    description:
      '4-bay portable tower RAID system with dual Thunderbolt 3 ports for up to 40Gb/s transfers.',
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
    ],
    variants: [
      {
        slug: 'filmraid-4a-72tb',
        totalTB: 72,
        perDriveTB: 18,
        priceEUR: 3599,
        raid0TB: 72,
        raid5TB: 54,
      },
      {
        slug: 'filmraid-4a-80tb',
        totalTB: 80,
        perDriveTB: 20,
        priceEUR: 3749,
        raid0TB: 80,
        raid5TB: 60,
      },
      {
        slug: 'filmraid-4a-88tb',
        totalTB: 88,
        perDriveTB: 22,
        priceEUR: 3999,
        raid0TB: 88,
        raid5TB: 66,
      },
      {
        slug: 'filmraid-4a-96tb',
        totalTB: 96,
        perDriveTB: 24,
        priceEUR: 4949,
        raid0TB: 96,
        raid5TB: 72,
      },
    ],
  },

  {
    id: 'filmraid-6',
    name: 'FilmRaid-6',
    hddCount: 6,
    image: '/layout/filmraid-6.jpg',
    back_image: '/layout/FilmRaid-6_back.jpg',
    description: '6-bay desktop RAID system with dual core processor and 2GB DDR3 ECC memory.',
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
    ],
    variants: [
      {
        slug: 'filmraid-6-108tb',
        totalTB: 108,
        perDriveTB: 18,
        priceEUR: 5299,
        raid0TB: 108,
        raid5TB: 90,
      },
      {
        slug: 'filmraid-6-120tb',
        totalTB: 120,
        perDriveTB: 20,
        priceEUR: 5499,
        raid0TB: 120,
        raid5TB: 100,
      },
      {
        slug: 'filmraid-6-132tb',
        totalTB: 132,
        perDriveTB: 22,
        priceEUR: 5799,
        raid0TB: 132,
        raid5TB: 110,
      },
      {
        slug: 'filmraid-6-144tb',
        totalTB: 144,
        perDriveTB: 24,
        priceEUR: 7299,
        raid0TB: 144,
        raid5TB: 120,
      },
    ],
  },

  {
    id: 'filmraid-8',
    name: 'FilmRaid-8',
    hddCount: 8,
    image: '/layout/filmraid-8.jpg',
    back_image: '/layout/FilmRaid-8_back.jpg',
    description: '8-bay tower RAID system with dual core processor and 2GB DDR3 ECC memory.',
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
      { label: 'Dimensions', value: '146 x 255 x 290 mm' },
      { label: 'Weight', value: '5.2 Kg diskless' },
      { label: 'Power', value: '270W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-8-144tb',
        totalTB: 144,
        perDriveTB: 18,
        priceEUR: 6599,
        raid0TB: 144,
        raid5TB: 126,
      },
      {
        slug: 'filmraid-8-160tb',
        totalTB: 160,
        perDriveTB: 20,
        priceEUR: 6999,
        raid0TB: 160,
        raid5TB: 140,
      },
      {
        slug: 'filmraid-8-176tb',
        totalTB: 176,
        perDriveTB: 22,
        priceEUR: 7349,
        raid0TB: 176,
        raid5TB: 154,
      },
      {
        slug: 'filmraid-8-192tb',
        totalTB: 192,
        perDriveTB: 24,
        priceEUR: 9399,
        raid0TB: 192,
        raid5TB: 168,
      },
    ],
  },

  {
    id: 'filmraid-12e',
    name: 'FilmRaid-12E',
    hddCount: 12,
    image: '/layout/filmraid-12e.jpg',
    back_image: '/layout/FilmRaid-12E_back.jpg',
    description:
      '12-bay tower RAID system (two-box shipment) with dual core processor and 8GB DDR4 ECC memory.',
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
      { label: 'Weight', value: '9.5 Kg diskless' },
      { label: 'Power', value: '400W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-12e-216tb',
        totalTB: 216,
        perDriveTB: 18,
        priceEUR: 9499,
        raid0TB: 216,
        raid5TB: 198,
      },
      {
        slug: 'filmraid-12e-240tb',
        totalTB: 240,
        perDriveTB: 20,
        priceEUR: 10049,
        raid0TB: 240,
        raid5TB: 220,
      },
      {
        slug: 'filmraid-12e-264tb',
        totalTB: 264,
        perDriveTB: 22,
        priceEUR: 10599,
        raid0TB: 264,
        raid5TB: 242,
      },
      {
        slug: 'filmraid-12e-288tb',
        totalTB: 288,
        perDriveTB: 24,
        priceEUR: 13649,
        raid0TB: 288,
        raid5TB: 264,
      },
    ],
  },
];
