import FAQ from '@/components/sections/faq';
import Features from '@/components/sections/features';
import Hero from '@/components/sections/hero';
import InReality from '@/components/sections/in-reality';
import ValueProposition from '@/components/sections/value-proposition';
import WhyUs from '@/components/sections/why-us';

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProposition />
      <Features />
      <WhyUs />
      <InReality />
      <FAQ />
    </>
  );
}
