import Image from 'next/image';

import { FileText, Zap, Lightbulb, Ruler, Scale, Radio } from 'lucide-react';

import SectionHeader from '@/components/section-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import productsData from '@/data/products.json';

const ICONS_MAP = {
  Zap,
  Lightbulb,
  Radio,
  Ruler,
  Scale,
} as const;

export default function SpecificationsPage() {
  const { products } = productsData;
  const product = products[3];
  return (
    <div className="hero-padding-margin container space-y-10.5">
      <SectionHeader
        category="Specifications"
        title="Product Details"
        description="Behind every field is smart engineering—dive into the full list of features that power your Sonic experience."
        icon={<FileText />}
      />

      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div className="relative aspect-[4.4/6] h-[420px] overflow-hidden rounded-3xl md:h-[520px] lg:h-[600px]">
          <Image src={product.image} alt="Product specifications" fill className="object-contain" />
        </div>

        <div className="flex-1 space-y-20">
          {Object.entries(product.specifications).map(([key, value]) => (
            <SpecificationSection
              key={key}
              title={key
                .split(/(?=[A-Z])/)
                .join(' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              specifications={value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SpecificationSectionProps {
  title: string;
  specifications: {
    key: string;
    label: string;
    value: string;
    icon?: string;
  }[];
}

function SpecificationSection({ title, specifications }: SpecificationSectionProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border-none py-0">
      <CardHeader className="bg-border inline-block px-4 py-3 text-xl font-semibold md:px-8">
        {title}
      </CardHeader>
      <CardContent className="p-4 md:p-8">
        <div className="">
          {specifications.map((spec) => {
            const Icon = spec.icon ? ICONS_MAP[spec.icon as keyof typeof ICONS_MAP] : null;

            return (
              <div
                key={spec.key}
                className="flex flex-col justify-between gap-3 border-b py-4 first:pt-0 lg:flex-row lg:items-center"
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="text-muted-foreground fill-input" />}
                  <span className="text-xl">{spec.label}</span>
                </div>
                <span className="text-xl lg:text-end">{spec.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
