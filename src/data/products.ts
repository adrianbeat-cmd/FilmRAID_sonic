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
      'The FilmRaid-4A is a professional 4-bay RAID tower designed for DITs, cinematographers, and on-set data management workflows. Featuring dual Thunderbolt 5 ports with up to 80Gb/s transfer speeds (120Gb/s with Bandwidth Boost), it delivers the performance needed for 4K, 6K, and 8K raw footage. Fully backward compatible with Thunderbolt 3 and 4. Built around enterprise-grade SAS drives and an Areca RAID controller, it supports RAID 0, 5, 6, 10, and JBOD — giving you full control over how you balance speed and redundancy. Available with Toshiba MG09SCA (18TB), Toshiba MG10SCA (20TB), Toshiba MG10SFA (22TB), or Seagate Exos X24 (24TB) enterprise SAS drives. Compact enough for a cart or a pelican case, yet powerful enough to handle the demands of a full shooting day. Ships pre-configured and ready to use from Barcelona, Spain. 3-year warranty included.',
    specs: [
      { label: 'Bays', value: '4 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 5 (80Gb/s)',
          'DisplayPort 2.1',
          'RJ45 Ethernet',
          'USB-C (USB 3.2 Gen 2)',
        ],
      },
      { label: 'RAID Levels', value: '0, 5, 6, 10, JBOD' },
      { label: 'Speed', value: 'Up to 5000MB/s read/write' },
      { label: 'Compatibility', value: 'Thunderbolt 3, 4 & 5 · macOS 15+ · Windows 11+' },
      { label: 'Dimensions', value: '123 x 165.6 x 232 mm' },
      { label: 'Weight', value: '3.6 Kg diskless' },
      { label: 'Power', value: '180W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-4a-72tb',
        totalTB: 72,
        perDriveTB: 18,
        priceEUR: 4249,
        raid0TB: 72,
        raid5TB: 54,
      },
      {
        slug: 'filmraid-4a-80tb',
        totalTB: 80,
        perDriveTB: 20,
        priceEUR: 4649,
        raid0TB: 80,
        raid5TB: 60,
      },
      {
        slug: 'filmraid-4a-88tb',
        totalTB: 88,
        perDriveTB: 22,
        priceEUR: 4949,
        raid0TB: 88,
        raid5TB: 66,
      },
      {
        slug: 'filmraid-4a-96tb',
        totalTB: 96,
        perDriveTB: 24,
        priceEUR: 5349,
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
    description:
      'The FilmRaid-6 is a professional 6-bay desktop RAID system built for film productions, post-production facilities, and data-intensive studio environments. Featuring dual Thunderbolt 5 ports with up to 80Gb/s transfer speeds (120Gb/s with Bandwidth Boost), it delivers sustained read/write speeds of up to 5000MB/s — enough for simultaneous 4K, 6K, and 8K multicam workflows. Fully backward compatible with Thunderbolt 3 and 4. Thunderbolt 5 daisy-chaining allows connection of up to 10 devices from a single port. RAID levels 0, 5, 6, 10, and JBOD give you complete flexibility for any pipeline. Available with Toshiba MG09SCA (18TB), Toshiba MG10SCA (20TB), Toshiba MG10SFA (22TB), or Seagate Exos X24 (24TB) enterprise SAS drives. Ships pre-configured and ready to plug in. Delivered across Europe via FedEx from Barcelona. 3-year warranty included.',
    specs: [
      { label: 'Bays', value: '6 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 5 (80Gb/s)',
          'DisplayPort 2.1',
          'RJ45 Ethernet',
          'USB-C (USB 3.2 Gen 2)',
        ],
      },
      { label: 'RAID Levels', value: '0, 5, 6, 10, JBOD' },
      { label: 'Speed', value: 'Up to 5000MB/s read/write' },
      { label: 'Compatibility', value: 'Thunderbolt 3, 4 & 5 · macOS 15+ · Windows 11+' },
      { label: 'Dimensions', value: '146 x 255 x 290 mm' },
      { label: 'Weight', value: '6.0 Kg diskless' },
      { label: 'Power', value: '180W' },
      { label: 'Cooling', value: '1 x 2700rpm fan' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-6-108tb',
        totalTB: 108,
        perDriveTB: 18,
        priceEUR: 6199,
        raid0TB: 108,
        raid5TB: 90,
      },
      {
        slug: 'filmraid-6-120tb',
        totalTB: 120,
        perDriveTB: 20,
        priceEUR: 6799,
        raid0TB: 120,
        raid5TB: 100,
      },
      {
        slug: 'filmraid-6-132tb',
        totalTB: 132,
        perDriveTB: 22,
        priceEUR: 7249,
        raid0TB: 132,
        raid5TB: 110,
      },
      {
        slug: 'filmraid-6-144tb',
        totalTB: 144,
        perDriveTB: 24,
        priceEUR: 7899,
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
    description:
      'The FilmRaid-8 is a high-capacity 8-bay professional RAID tower engineered for demanding film and broadcast workflows. With up to 192TB of raw storage, sustained speeds of up to 5000MB/s, and support for DisplayPort 2.1 (dual 6K or 8K 60Hz output), it handles the most data-intensive productions without compromise. Featuring dual Thunderbolt 5 ports — fully backward compatible with Thunderbolt 3 and 4 — and built on an Areca RAID controller, it supports RAID 0, 5, 6, 10, and JBOD. Available with Toshiba MG09SCA (18TB), Toshiba MG10SCA (20TB), Toshiba MG10SFA (22TB), or Seagate Exos X24 (24TB) enterprise SAS drives. Pre-installed and pre-configured, ready to use the moment it arrives. Ideal for DITs managing large shooting days, editors working with 6K and 8K footage, and post houses that need reliable high-volume storage. Delivered across Europe via FedEx from Barcelona. 3-year warranty included.',
    specs: [
      { label: 'Bays', value: '8 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 5 (80Gb/s)',
          'DisplayPort 2.1',
          'RJ45 Ethernet',
          'USB-C (USB 3.2 Gen 2)',
        ],
      },
      { label: 'RAID Levels', value: '0, 5, 6, 10, JBOD' },
      { label: 'Speed', value: 'Up to 5000MB/s read/write' },
      { label: 'Compatibility', value: 'Thunderbolt 3, 4 & 5 · macOS 15+ · Windows 11+' },
      { label: 'Dimensions', value: '146 x 302 x 290 mm' },
      { label: 'Weight', value: '6.8 Kg diskless' },
      { label: 'Power', value: '300W' },
      { label: 'Cooling', value: '2 x 2700rpm fans' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-8-144tb',
        totalTB: 144,
        perDriveTB: 18,
        priceEUR: 7999,
        raid0TB: 144,
        raid5TB: 126,
      },
      {
        slug: 'filmraid-8-160tb',
        totalTB: 160,
        perDriveTB: 20,
        priceEUR: 8799,
        raid0TB: 160,
        raid5TB: 140,
      },
      {
        slug: 'filmraid-8-176tb',
        totalTB: 176,
        perDriveTB: 22,
        priceEUR: 9399,
        raid0TB: 176,
        raid5TB: 154,
      },
      {
        slug: 'filmraid-8-192tb',
        totalTB: 192,
        perDriveTB: 24,
        priceEUR: 10249,
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
      'The FilmRaid-12E is our flagship 12-bay professional RAID system — the maximum capacity option for productions and facilities that cannot afford storage bottlenecks. With up to 288TB of raw storage and up to 5000MB/s sustained transfer speeds, it handles simultaneous 8K multicam recording, large-scale digital archiving, and the most demanding post-production pipelines. Featuring dual Thunderbolt 5 ports — fully backward compatible with Thunderbolt 3 and 4 — and built on an Areca RAID controller with DisplayPort 2.1 output (dual 6K or 8K 60Hz), it supports RAID 0, 5, 6, 10, and JBOD. Available with Toshiba MG09SCA (18TB), Toshiba MG10SCA (20TB), Toshiba MG10SFA (22TB), or Seagate Exos X24 (24TB) enterprise SAS drives. Due to its size, the FilmRaid-12E ships in two boxes and arrives fully configured and tested. Designed for rental houses, broadcast facilities, high-end post-production studios, and productions working with very large daily data volumes. Delivered across Europe via FedEx from Barcelona. 3-year warranty included.',
    specs: [
      { label: 'Bays', value: '12 x 3.5"/2.5" SAS/SATA' },
      {
        label: 'Ports',
        value: [
          '2x Thunderbolt 5 (80Gb/s)',
          'DisplayPort 2.1',
          'RJ45 Ethernet',
          'USB-C (USB 3.2 Gen 2)',
        ],
      },
      { label: 'RAID Levels', value: '0, 5, 6, 10, JBOD' },
      { label: 'Speed', value: 'Up to 5000MB/s read/write' },
      { label: 'Compatibility', value: 'Thunderbolt 3, 4 & 5 · macOS 15+ · Windows 11+' },
      { label: 'Dimensions', value: '206 x 310 x 290 mm' },
      { label: 'Weight', value: '9.5 Kg diskless' },
      { label: 'Power', value: '400W' },
      { label: 'Cooling', value: '2 x 2700rpm fans' },
      { label: 'Warranty', value: '3 Years' },
    ],
    variants: [
      {
        slug: 'filmraid-12e-216tb',
        totalTB: 216,
        perDriveTB: 18,
        priceEUR: 11299,
        raid0TB: 216,
        raid5TB: 198,
      },
      {
        slug: 'filmraid-12e-240tb',
        totalTB: 240,
        perDriveTB: 20,
        priceEUR: 12499,
        raid0TB: 240,
        raid5TB: 220,
      },
      {
        slug: 'filmraid-12e-264tb',
        totalTB: 264,
        perDriveTB: 22,
        priceEUR: 13399,
        raid0TB: 264,
        raid5TB: 242,
      },
      {
        slug: 'filmraid-12e-288tb',
        totalTB: 288,
        perDriveTB: 24,
        priceEUR: 14649,
        raid0TB: 288,
        raid5TB: 264,
      },
    ],
  },
];
