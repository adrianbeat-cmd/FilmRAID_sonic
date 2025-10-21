import React from 'react';

import { HardDrive, Clock, Shield, Film } from 'lucide-react';

import SectionHeader from '../section-header';
import { Card, CardHeader, CardContent } from '../ui/card';

const benefits = [
  {
    icon: <Clock className="size-6" />,
    value: '3-Day EU Delivery',
    description:
      'Get your custom RAID system delivered across Europe in just 3 days—no ' + 'stock delays.',
  },
  {
    icon: <HardDrive className="size-6" />,
    value: 'High-Performance RAID',
    description:
      'Secure, fast storage solutions tailored for film post-production and ' +
      'digital cinema workflows.',
  },
  {
    icon: <Shield className="size-6" />,
    value: 'Expert-Backed Reliability',
    description:
      'Built on years of expertise, ensuring top-tier quality and ' + 'support for filmmakers.',
  },
];

export default function WhyUs() {
  return (
    <section className="section-padding container space-y-10.5">
      <SectionHeader
        icon={<Film />}
        category="Why Choose FilmRAID?"
        title="Tailored Storage Solutions for Filmmakers"
        description={
          'We specialize in custom RAID systems that deliver speed, security, ' +
          'and simplicity for your film projects. Backed by industry experts, ' +
          "we're here to support your creative workflow."
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {benefits.map((benefit, index) => (
          <Card key={index} className="gap-20 border-none p-8 shadow-none">
            <CardHeader className="p-0">
              <div className="border-input text-muted-foreground flex size-12 items-center justify-center rounded-full border">
                {benefit.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <h3 className="text-3xl font-bold">{benefit.value}</h3>
              <p className="text-xl leading-8">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
