// src/app/products-feed.xml/route.ts
import { products } from '@/data/products';

export const dynamic = 'force-static';
export const revalidate = 3600;

const SITE = 'https://www.filmraid.pro';

type Sku = {
  id: string;
  title: string;
  url: string;
  priceEUR: number;
  image: string;
  shippingWeightKg: number;
  availability: 'in stock';
  description: string;
};

// Clean product list from central data (only 16 products, no duplicates)
const PRODUCTS: Sku[] = products.flatMap((model) =>
  model.variants.map((v) => ({
    id: v.slug,
    title: `${model.name} – ${v.totalTB} TB`,
    url: `${SITE}/products/${v.slug}`,
    priceEUR: v.priceEUR,
    image: `${SITE}${model.image}`,
    shippingWeightKg:
      model.hddCount === 4 ? 8 : model.hddCount === 6 ? 12 : model.hddCount === 8 ? 18 : 22,
    availability: 'in stock' as const,
    description: `${model.name} professional RAID system with ${v.totalTB}TB total capacity. Optimized for film and video workflows. Enterprise-grade drives and Areca hardware.`,
  })),
);

// Shipping table
const SHIPPING_TABLE = [
  { country: 'ES', service: 'Standard (24–48 h)', priceEUR: 70.35 },
  { country: 'AT', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'BE', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'BG', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'HR', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'CY', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'CZ', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'DK', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'EE', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'FI', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'FR', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'DE', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'GR', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'HU', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'IE', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'IT', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'LV', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'LT', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'LU', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'MT', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'NL', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'PL', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'PT', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'RO', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'SK', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'SI', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'SE', service: 'International Economy (3–7 days)', priceEUR: 120 },
  { country: 'US', service: 'International Economy (3–7 days) — DAP', priceEUR: 196.66 },
  { country: 'CA', service: 'International Economy (3–7 days) — DAP', priceEUR: 196.66 },
  { country: 'GB', service: 'International Economy (3–7 days) — DAP', priceEUR: 150 },
  { country: 'CH', service: 'International Economy (3–7 days) — DAP', priceEUR: 150 },
  { country: 'AU', service: 'International Economy (3–7 days) — DAP', priceEUR: 260 },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function itemXml(p: Sku): string {
  const shippingLines = SHIPPING_TABLE.map(
    (r) => `
    <g:shipping>
      <g:country>${r.country}</g:country>
      <g:service>${esc(r.service)}</g:service>
      <g:price>${r.priceEUR.toFixed(2)} EUR</g:price>
    </g:shipping>`,
  ).join('');

  return `
  <item>
    <g:id>${p.id}</g:id>
    <title>${esc(p.title)}</title>
    <description>${esc(p.description)}</description>
    <link>${p.url}</link>
    <g:image_link>${p.image}</g:image_link>
    <g:availability>${p.availability}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${p.priceEUR} EUR</g:price>
    <g:brand>FilmRAID</g:brand>
    <g:mpn>${p.id}</g:mpn>
    <g:shipping_weight>${p.shippingWeightKg.toFixed(1)} kg</g:shipping_weight>
${shippingLines}
  </item>`;
}

function feedXml(items: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>FilmRAID Product Feed</title>
    <link>${SITE}</link>
    <description>Professional RAID systems for filmmakers</description>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  const xml = feedXml(PRODUCTS.map(itemXml).join('\n'));

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
