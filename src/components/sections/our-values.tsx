import React from 'react';

import { Box, Shield, Leaf } from 'lucide-react';

import SectionHeader from '../section-header';
import { Card, CardHeader, CardContent } from '../ui/card';

const values = [
  {
    icon: <Box className="size-6" />,
    value: 'Simplicity',
    description: 'We believe less is more—our products are designed for intuitive use.',
  },
  {
    icon: <Shield className="size-6" />,
    value: 'Quality',
    description: 'From premium components to final sound output, every detail matters.',
  },
  {
    icon: <Leaf className="size-6" />,
    value: 'Sustainability',
    description: "Thoughtful design that's better for the planet.",
  },
];

export default function OurValues() {
  return (
    <section className="section-padding container space-y-10.5">
      <SectionHeader
        icon={<Box />}
        category="Our Values"
        title="What We Value"
        description="We believe great sound should be simple, powerful and accessible. Our values are rooted in a deep respect for our community."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {values.map((value, index) => (
          <Card key={index} className="gap-20 border-none p-8 shadow-none">
            <CardHeader className="p-0">
              <div className="border-input text-muted-foreground flex size-12 items-center justify-center rounded-full border">
                {value.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <h3 className="text-3xl font-bold">{value.value}</h3>
              <p className="text-xl leading-8">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
