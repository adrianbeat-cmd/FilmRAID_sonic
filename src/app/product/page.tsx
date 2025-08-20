import BigSound from '@/components/sections/big-sound';
import ProductFeatures from '@/components/sections/product-features';
import ProductHero from '@/components/sections/product-hero';
import ProductIntro from '@/components/sections/product-intro';
import Testimonials from '@/components/sections/product-testimonials';
import ServiceFeatures from '@/components/sections/service-features';

export default function ProductPage() {
  return (
    <>
      <ProductHero />
      <ProductIntro />
      <BigSound />
      <Testimonials />
      <ProductFeatures />
      <ServiceFeatures />
    </>
  );
}
