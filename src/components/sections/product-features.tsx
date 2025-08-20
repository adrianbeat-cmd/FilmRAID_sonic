import Image from 'next/image';

import { AudioLines } from 'lucide-react';

const FEATURES = [
  {
    id: '01',
    title: 'Powerful Sound',
    description: 'Enjoy rich bass and clear highs for a truly immersive audio experience.',
  },
  {
    id: '02',
    title: 'Wireless Freedom',
    description: 'Instant Bluetooth connection for smooth, hassle-free playback.',
  },
  {
    id: '03',
    title: 'Long Battery Life',
    description: 'Get up to 20 hours of nonstop playtime on a single charge.',
  },
  {
    id: '04',
    title: 'Compact & Portable',
    description: 'Sleek, lightweight design—perfect for music on the go.',
  },
];

export default function ProductFeatures() {
  return (
    <section className="section-padding container flex flex-col gap-8 md:flex-row md:gap-16">
      <div className="relative aspect-[4/4.14] overflow-hidden rounded-3xl md:min-w-[400px]">
        <Image
          src="/images/products/product-6.webp"
          alt="Pure Performance"
          fill
          className="object-cover"
        />
        <div className="bg-background dark:bg-background absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-6 py-3">
          <AudioLines />
          <span className="text-lg whitespace-nowrap">High-Quality Sound</span>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl md:text-4xl md:text-balance lg:text-5xl lg:leading-14">
          Designed for Pure Performance
        </h2>

        <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-y-0">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="space-y-6 px-4 py-7.5 md:px-7.5 lg:first:border-e lg:first:border-b lg:last:border-s lg:last:border-t"
            >
              <div className="flex items-center gap-3 text-xl font-medium">
                <span className="">{feature.id}</span>
                <h3 className="">{feature.title}</h3>
              </div>
              <p className="">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
