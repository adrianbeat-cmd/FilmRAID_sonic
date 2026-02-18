import { notFound } from 'next/navigation';

import ProductClient from './ProductClient';
import { products } from '@/data/products';

interface Params {
  slug: string;
}

const ProductPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;

  // Find the variant in our central data
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

  const availableRaids = (model.specs.find((s) => s.label === 'RAID Levels')
    ?.value as string[]) || ['RAID 0', 'RAID 5'];

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

export default ProductPage;
