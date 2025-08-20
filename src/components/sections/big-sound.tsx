import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight, AudioLines } from 'lucide-react';

import AnimatedBorderButton from '../animated-border-button';

const feature = {
  icon: <AudioLines />,
  label: 'Big Sound, Wherever You Are',
  title: 'Enjoy crisp highs and full-bodied audio that travels with you.',
  description:
    'Crafted to deliver stunning sound quality—at home, outdoors, or anywhere in between.',
  image: '/images/products/product-5.webp',
  link: {
    text: 'Buy now',
    href: '/pricing',
  },
};

const BigSound = () => {
  return (
    <section className="section-padding container flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
      <div className="">
        <div className="space-y-6 md:space-y-8 lg:space-y-10.5">
          <div className="flex items-center gap-3">
            {feature.icon}
            <p className="text-xl leading-8 md:leading-10">{feature.label}</p>
          </div>
          <h3 className="text-2xl font-medium md:text-3xl lg:text-4xl">{feature.title}</h3>
          <p className="text-xl leading-8">{feature.description}</p>
        </div>
        <AnimatedBorderButton
          asChild
          wrapperClassName="w-fit mt-4"
          className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
        >
          <Link href={feature.link.href}>
            {feature.link.text} <ChevronRight />
          </Link>
        </AnimatedBorderButton>
      </div>
      <div className="relative h-[340px] w-full sm:h-[600px] sm:min-w-[440px] lg:w-[569px] lg:shrink-0">
        <Image
          src={feature.image}
          alt={feature.label}
          fill
          className="rounded-3xl object-cover object-[70%_30%]"
        />
      </div>
    </section>
  );
};

export default BigSound;
