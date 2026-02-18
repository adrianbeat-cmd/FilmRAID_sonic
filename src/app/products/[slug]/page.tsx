import { notFound } from 'next/navigation';

import ProductClient from './ProductClient';
import { products } from '@/data/products';

interface Params {
  slug: string;
}

const ProductPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;

  const variant = products
    .flatMap((model) =>
      model.variants.map((v) => ({
        ...v,
        model,
      })),
    )
    .find((v) => v.slug === slug);

  if (!variant) notFound();

  const { model, totalTB, perDriveTB, priceEUR, raid0TB, raid5TB } = variant;

  // Safe normalization of RAID levels (handles string or array)
  const raidLevelsSpec = model.specs.find((s) => s.label === 'RAID Levels');
  let availableRaids: string[] = ['RAID 0', 'RAID 5']; // safe default

  if (raidLevelsSpec?.value) {
    if (Array.isArray(raidLevelsSpec.value)) {
      availableRaids = raidLevelsSpec.value;
    } else if (typeof raidLevelsSpec.value === 'string') {
      availableRaids = raidLevelsSpec.value.split(',').map((r) => r.trim());
    }
  }

  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: `${model.name} ${totalTB}TB`,
    description: model.description,
    sku: slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: priceEUR,
      availability: 'http://schema.org/InStock',
      url: `https://www.filmraid.pro/products/${slug}`,
    },
    image: `https://www.filmraid.pro${model.image}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductClient
        currentModel={model}
        tb={perDriveTB}
        raid0={raid0TB}
        raid5={raid5TB}
        price={priceEUR}
        images={[model.image, model.back_image]}
        availableRaids={availableRaids}
      />
    </>
  );
};

export async function generateStaticParams() {
  return products.flatMap((model) =>
    model.variants.map((v) => ({
      slug: v.slug,
    })),
  );
}

export default ProductPage;
