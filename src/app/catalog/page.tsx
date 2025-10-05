import { notFound } from 'next/navigation';

import ProductClient from './ProductClient';

// Model data with images, back images, descriptions, and specs
const modelData = [
  {
    name: 'FilmRaid-4A',
    hddCount: 4,
    image: '/layout/filmraid-4a.jpg',
    back_image: '/layout/FilmRaid-4A_back.jpg',
    description:
      '4-bay portable tower RAID system with dual Thunderbolt 3 ports for up to 40Gb/s transfers. Supports SAS/SATA drives, RAID 0/1/1E/3/5/6/10, DisplayPort, USB-A. Ideal for compact, high-speed film workflows.',
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
    description:
      '6-bay desktop RAID system with dual core processor and 2GB DDR3 ECC memory. Supports 4K/6K/8K workflows, RAID 0/1/1E/3/5/6/10/30/50/60, low-noise fan, 180W power. Perfect for professional post-production setups.',
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
    description:
      '8-bay tower RAID system with dual core processor and 2GB DDR3 ECC memory. Thunderbolt 3 up to 40Gb/s, DisplayPort 1.4 for 8K 30Hz, RAID 0/1/1E/3/5/6/10/30/50/60. Perfect for large-scale film projects.',
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
    description:
      '12-bay tower RAID system with dual core processor and 8GB DDR4 ECC memory. Thunderbolt 3 up to 40Gb/s, DisplayPort 1.4 for 8K 30Hz, RAID 0/1/1E/3/5/6/10/30/50/60. Ideal for large-scale film projects.',
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
      {
        label: 'OS Support',
        value: 'Thunderbolt 3: macOS 10.12 or later & Windows 8/10 or later; USB: OS Independent',
      },
    ],
  },
];

// Capacity options
const capacityOptions = [
  { tb: 18, prices: [2949, 4279, 5239, 7589] },
  { tb: 20, prices: [3129, 4549, 5599, 8129] },
  { tb: 22, prices: [3219, 4679, 5779, 8399] },
];

interface Params {
  slug: string;
}

const ProductPage = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Parse slug, e.g., 'filmraid-4a-72tb'
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 3) notFound();
  const modelLower = 'filmraid-' + parts[1];
  const capacityStr = parts[2].replace('tb', '');
  const totalTb = parseInt(capacityStr);
  if (isNaN(totalTb)) notFound();

  const selectedModel = modelData.findIndex((m) => m.name.toLowerCase() === modelLower);
  if (selectedModel === -1) notFound();

  const currentModel = modelData[selectedModel];
  const hdd = currentModel.hddCount;
  if (totalTb % hdd !== 0) notFound();
  const perDriveTb = totalTb / hdd;

  const selectedCapacity = capacityOptions.findIndex((c) => c.tb === perDriveTb);
  if (selectedCapacity === -1) notFound();

  const currentCapacity = capacityOptions[selectedCapacity];
  const raid0 = totalTb;
  const raid5 = totalTb - perDriveTb;
  const price = currentCapacity.prices[selectedModel];
  const images = [currentModel.image, currentModel.back_image];

  // Define available RAID levels based on model
  const raidLevelsSpec = currentModel.specs.find((spec) => spec.label === 'RAID Levels');
  const availableRaids =
    typeof raidLevelsSpec?.value === 'string'
      ? raidLevelsSpec.value.split(', ').map((raid) => raid.trim())
      : [];

  // JSON-LD for Snipcart crawling
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: `${currentModel.name} ${raid0}TB`,
    description: currentModel.description,
    sku: `${currentModel.name.toLowerCase()}-${raid0}tb`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: price,
      availability: 'http://schema.org/InStock',
      url: `https://www.filmraid.pro/products/${currentModel.name.toLowerCase()}-${raid0}tb`,
    },
    image: `https://www.filmraid.pro${images[0]}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <button
        hidden
        className="snipcart-add-item"
        data-crawler="snipcart"
        data-item-id={`${currentModel.name.toLowerCase()}-${raid0}tb`}
        data-item-price={price}
        data-item-url={`https://www.filmraid.pro/products/${currentModel.name.toLowerCase()}-${raid0}tb`}
        data-item-description={currentModel.description}
        data-item-name={`${currentModel.name} ${raid0}TB`}
        data-item-image={`https://www.filmraid.pro${images[0]}`}
        data-item-quantity={1}
        data-item-custom1-name="RAID-Level"
        data-item-custom1-options={availableRaids.join('|')}
        data-item-custom1-value={availableRaids[0] || '0'}
        data-item-shippable="true"
        data-item-taxable="true"
      >
        Add to Cart
      </button>
      <ProductClient
        currentModel={currentModel}
        tb={perDriveTb}
        raid0={raid0}
        raid5={raid5}
        price={price}
        images={images}
        availableRaids={availableRaids}
      />
    </>
  );
};

export async function generateStaticParams() {
  return [
    { slug: 'filmraid-4a-72tb' },
    { slug: 'filmraid-4a-80tb' },
    { slug: 'filmraid-4a-88tb' },
    { slug: 'filmraid-6-108tb' },
    { slug: 'filmraid-6-120tb' },
    { slug: 'filmraid-6-132tb' },
    { slug: 'filmraid-8-144tb' },
    { slug: 'filmraid-8-160tb' },
    { slug: 'filmraid-8-176tb' },
    { slug: 'filmraid-12e-216tb' },
    { slug: 'filmraid-12e-240tb' },
    { slug: 'filmraid-12e-264tb' },
  ];
}

export default ProductPage;
