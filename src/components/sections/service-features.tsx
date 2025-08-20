'use client';
import { Headphones, Package, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    id: '01',
    title: 'Customer service',
    description: "It's not actually free we just price it into the products.",
    icon: Headphones,
  },
  {
    id: '02',
    title: 'Fast Free Shipping',
    description: 'Get free shipping on orders of $150 or more',
    icon: Package,
  },
  {
    id: '03',
    title: 'Secure payment',
    description: "It's not actually free we just price it",
    icon: ShieldCheck,
  },
];

export default function ServiceFeatures() {
  return (
    <section className="perspective-1000 container grid grid-cols-1 divide-y pt-5 pb-15 md:mt-16 md:grid-cols-3 md:divide-x md:divide-y-0 md:border-t md:pt-15 lg:mt-20">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="flex gap-4 py-8 first:ps-0 md:px-8 md:py-0">
          <feature.icon />
          <div className="space-y-3">
            <h2 className="text-xl font-bold">{feature.title}</h2>
            <p className="">{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
