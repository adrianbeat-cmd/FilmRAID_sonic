// src/app/products-feed.xml/route.ts
export const dynamic = 'force-static';
export const revalidate = 3600;
const SITE = 'https://www.filmraid.pro';
const backImg = (url: string) => url.replace(/(\.(jpg|jpeg|png|webp))$/i, '_back$1');

type Sku = {
  id: string;
  title: string;
  url: string;
  priceEUR: number;
  image: string;
  shippingWeightKg: number;
  availability: 'in stock' | 'preorder' | 'out of stock';
  description: string;
};

const PRODUCTS: Sku[] = [
  // --- FilmRAID-4A (8 kg)
  {
    id: 'FR-4A-72',
    title: 'FilmRAID-4A – 72 TB',
    url: `${SITE}/products/filmraid-4a-72tb`,
    priceEUR: 3129,
    image: `${SITE}/layout/FilmRaid-4A.jpg`,
    shippingWeightKg: 8.0,
    availability: 'in stock',
    description: 'All-in-one 4-bay RAID with 72 TB raw capacity.',
  },
  {
    id: 'FR-4A-80',
    title: 'FilmRAID-4A – 80 TB',
    url: `${SITE}/products/filmraid-4a-80tb`,
    priceEUR: 3199,
    image: `${SITE}/layout/FilmRaid-4A.jpg`,
    shippingWeightKg: 8.0,
    availability: 'in stock',
    description: 'All-in-one 4-bay RAID with 80 TB raw capacity.',
  },
  {
    id: 'FR-4A-88',
    title: 'FilmRAID-4A – 88 TB',
    url: `${SITE}/products/filmraid-4a-88tb`,
    priceEUR: 3369,
    image: `${SITE}/layout/FilmRaid-4A.jpg`,
    shippingWeightKg: 8.0,
    availability: 'in stock',
    description: 'All-in-one 4-bay RAID with 88 TB raw capacity.',
  },

  // --- FilmRAID-6 (12 kg)
  {
    id: 'FR-6-108',
    title: 'FilmRAID-6 – 108 TB',
    url: `${SITE}/products/filmraid-6-108tb`,
    priceEUR: 4549,
    image: `${SITE}/layout/FilmRaid-6.jpg`,
    shippingWeightKg: 12.0,
    availability: 'in stock',
    description: '6-bay RAID tuned for film workflows.',
  },
  {
    id: 'FR-6-120',
    title: 'FilmRAID-6 – 120 TB',
    url: `${SITE}/products/filmraid-6-120tb`,
    priceEUR: 4649,
    image: `${SITE}/layout/FilmRaid-6.jpg`,
    shippingWeightKg: 12.0,
    availability: 'in stock',
    description: '6-bay RAID with 120 TB raw capacity.',
  },
  {
    id: 'FR-6-132',
    title: 'FilmRAID-6 – 132 TB',
    url: `${SITE}/products/filmraid-6-132tb`,
    priceEUR: 4909,
    image: `${SITE}/layout/FilmRaid-6.jpg`,
    shippingWeightKg: 12.0,
    availability: 'in stock',
    description: '6-bay RAID with 132 TB raw capacity.',
  },

  // --- FilmRAID-8 (18 kg)
  {
    id: 'FR-8-144',
    title: 'FilmRAID-8 – 144 TB',
    url: `${SITE}/products/filmraid-8-144tb`,
    priceEUR: 5599,
    image: `${SITE}/layout/FilmRaid-8.jpg`,
    shippingWeightKg: 18.0,
    availability: 'in stock',
    description: '8-bay RAID with 144 TB raw capacity.',
  },
  {
    id: 'FR-8-160',
    title: 'FilmRAID-8 – 160 TB',
    url: `${SITE}/products/filmraid-8-160tb`,
    priceEUR: 5749,
    image: `${SITE}/layout/FilmRaid-8.jpg`,
    shippingWeightKg: 18.0,
    availability: 'in stock',
    description: '8-bay RAID with 160 TB raw capacity.',
  },
  {
    id: 'FR-8-176',
    title: 'FilmRAID-8 – 176 TB',
    url: `${SITE}/products/filmraid-8-176tb`,
    priceEUR: 6079,
    image: `${SITE}/layout/FilmRaid-8.jpg`,
    shippingWeightKg: 18.0,
    availability: 'in stock',
    description: '8-bay RAID with 176 TB raw capacity.',
  },

  // --- FilmRAID-12E (10 + 12 kg = 22 kg)
  {
    id: 'FR-12E-216',
    title: 'FilmRAID-12E – 216 TB',
    url: `${SITE}/products/filmraid-12e-216tb`,
    priceEUR: 8129,
    image: `${SITE}/layout/FilmRaid-12E.jpg`,
    shippingWeightKg: 22.0,
    availability: 'in stock',
    description: '12-bay RAID (two-box shipment) with 216 TB capacity.',
  },
  {
    id: 'FR-12E-240',
    title: 'FilmRAID-12E – 240 TB',
    url: `${SITE}/products/filmraid-12e-240tb`,
    priceEUR: 8349,
    image: `${SITE}/layout/FilmRaid-12E.jpg`,
    shippingWeightKg: 22.0,
    availability: 'in stock',
    description: '12-bay RAID (two-box shipment) with 240 TB capacity.',
  },
  {
    id: 'FR-12E-264',
    title: 'FilmRAID-12E – 264 TB',
    url: `${SITE}/products/filmraid-12e-264tb`,
    priceEUR: 8849,
    image: `${SITE}/layout/FilmRaid-12E.jpg`,
    shippingWeightKg: 22.0,
    availability: 'in stock',
    description: '12-bay RAID (two-box shipment) with 264 TB capacity.',
  },
];

// --- Shipping table (unchanged, FedEx-style) ---
const EU_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
] as const;

type ShippingRow = { country: string; service: string; priceEUR: number };
const SHIPPING_TABLE: ShippingRow[] = [
  { country: 'ES', service: 'Standard (24–48 h)', priceEUR: 70.35 },
  ...EU_COUNTRIES.filter((c) => c !== 'ES').map<ShippingRow>((c) => ({
    country: c,
    service: 'International Economy (3–7 days)',
    priceEUR: 120.0,
  })),
  { country: 'US', service: 'International Economy (3–7 days) — DAP', priceEUR: 196.66 },
  { country: 'CA', service: 'International Economy (3–7 days) — DAP', priceEUR: 196.66 },
  { country: 'GB', service: 'International Economy (3–7 days) — DAP', priceEUR: 150.0 },
  { country: 'CH', service: 'International Economy (3–7 days) — DAP', priceEUR: 150.0 },
  { country: 'AU', service: 'International Economy (3–7 days) — DAP', priceEUR: 260.0 },
  { country: 'MX', service: 'International Economy (3–7 days) — DAP', priceEUR: 230.0 },
  { country: 'AR', service: 'International Economy (3–7 days) — DAP', priceEUR: 260.0 },
  { country: 'BR', service: 'International Economy (3–7 days) — DAP', priceEUR: 260.0 },
  { country: 'CL', service: 'International Economy (3–7 days) — DAP', priceEUR: 240.0 },
];

// --- Helpers ---
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
    <g:additional_image_link>${backImg(p.image)}</g:additional_image_link>
    <g:availability>${p.availability}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${p.priceEUR.toFixed(2)} EUR</g:price>
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
    <description>FilmRAID product feed for Google Merchant</description>
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
