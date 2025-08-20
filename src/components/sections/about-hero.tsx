import Image from 'next/image';

export function AboutHero() {
  return (
    <section className="hero-padding container flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-16">
      <div className="space-y-8">
        <h1 className="text-5xl leading-13 font-bold text-balance md:text-6xl md:leading-18">
          Sound Designed for Life
        </h1>
        <p className="max-w-3xl text-xl leading-8">
          At Sonic, we're redefining how you experience audio—merging premium sound quality with
          sleek, durable design. Built for everyday moments and extraordinary adventures, our
          speakers are crafted to deliver deep, immersive sound wherever life takes you.
        </p>
      </div>
      <Image
        src="/images/products/main-product.webp"
        alt="Sonic Logo"
        width={700}
        height={528}
        className="aspect-[6.44/5.28] object-contain"
        priority
      />
    </section>
  );
}
