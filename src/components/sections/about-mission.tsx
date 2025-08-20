import Image from 'next/image';

import { AudioLines } from 'lucide-react';

const missions = [
  {
    title: 'Our Mission',
    description:
      "To craft beautifully designed speakers that deliver powerful, crystal-clear sound—whether you're relaxing at home, exploring the outdoors, or hosting a party. Sound that moves with you, wherever life takes you.",
  },
  {
    title: 'Our Vision',
    description:
      'To become a global leader in portable audio innovation—blending performance, durability, and design into one seamless experience that connects people through the power of sound.',
  },
];

const AboutMission = () => {
  return (
    <section className="section-padding container flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
      <div className="relative h-[340px] w-full sm:h-[600px] sm:min-w-[440px] lg:w-[569px] lg:shrink-0">
        <Image
          src="/images/about/who-we-are.webp"
          alt="Our Team"
          fill
          className="rounded-3xl object-cover object-top"
        />
      </div>
      <div className="space-y-6 md:space-y-8 lg:space-y-10.5">
        <div className="flex items-center gap-3">
          <AudioLines />
          <p className="text-xl leading-8 md:leading-10">Who We Are</p>
        </div>
        {missions.map((mission, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-2xl font-medium md:text-3xl lg:text-4xl">{mission.title}</h3>
            <p className="text-xl leading-8">{mission.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutMission;
