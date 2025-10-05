// /src/app/products-feed.xml/route.ts
export const dynamic = 'force-static';

type Item = {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string[];
  price: string; // "1234.00 EUR"
  brand: string;
  mpn: string;
  condition: 'new';
  availability: 'in stock';
  google_product_category?: string;
  product_type?: string;
};

const ORIGIN = 'https://www.filmraid.pro';
const eur = (n: number) => `${n.toFixed(2)} EUR`;
const img = (file: string) => `${ORIGIN}/layout/${file}`;

// --- English descriptions ---
const desc4A =
  'Compact 4-bay RAID system for on-set and postproduction workflows. Quiet cooling, tool-free access, and enterprise-grade drives for sustained performance.';
const desc6 =
  '6-bay RAID system designed for DIT carts and editing studios requiring both capacity and data protection. Built with enterprise HDDs for reliability.';
const desc8 =
  '8-bay RAID system for high-throughput multi-camera ingest and post. Hot-swap bays, flexible RAID levels, and rock-solid transfer speeds.';
const desc12E =
  '12-bay expandable RAID with the highest capacity and resilience. Configurable for performance or redundancy — perfect for finishing, dailies, and large-scale backups.';

const items: Item[] = [
  // 4A
  {
    id: 'FR-4A-18',
    title: 'FilmRAID-4A – 18TB',
    description: desc4A,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-4A.jpg'),
    additional_image_link: [img('FilmRaid-4A_back.jpg')],
    price: eur(2949),
    brand: 'FilmRAID',
    mpn: 'FR-4A-18',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-4A-20',
    title: 'FilmRAID-4A – 20TB',
    description: desc4A,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-4A.jpg'),
    additional_image_link: [img('FilmRaid-4A_back.jpg')],
    price: eur(3129),
    brand: 'FilmRAID',
    mpn: 'FR-4A-20',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-4A-22',
    title: 'FilmRAID-4A – 22TB',
    description: desc4A,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-4A.jpg'),
    additional_image_link: [img('FilmRaid-4A_back.jpg')],
    price: eur(3219),
    brand: 'FilmRAID',
    mpn: 'FR-4A-22',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },

  // 6
  {
    id: 'FR-6-18',
    title: 'FilmRAID-6 – 18TB',
    description: desc6,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-6.jpg'),
    additional_image_link: [img('FilmRaid-6_back.jpg')],
    price: eur(4279),
    brand: 'FilmRAID',
    mpn: 'FR-6-18',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-6-20',
    title: 'FilmRAID-6 – 20TB',
    description: desc6,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-6.jpg'),
    additional_image_link: [img('FilmRaid-6_back.jpg')],
    price: eur(4549),
    brand: 'FilmRAID',
    mpn: 'FR-6-20',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-6-22',
    title: 'FilmRAID-6 – 22TB',
    description: desc6,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-6.jpg'),
    additional_image_link: [img('FilmRaid-6_back.jpg')],
    price: eur(4679),
    brand: 'FilmRAID',
    mpn: 'FR-6-22',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },

  // 8
  {
    id: 'FR-8-18',
    title: 'FilmRAID-8 – 18TB',
    description: desc8,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-8.jpg'),
    additional_image_link: [img('FilmRaid-8_back.jpg')],
    price: eur(5239),
    brand: 'FilmRAID',
    mpn: 'FR-8-18',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-8-20',
    title: 'FilmRAID-8 – 20TB',
    description: desc8,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-8.jpg'),
    additional_image_link: [img('FilmRaid-8_back.jpg')],
    price: eur(5599),
    brand: 'FilmRAID',
    mpn: 'FR-8-20',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-8-22',
    title: 'FilmRAID-8 – 22TB',
    description: desc8,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-8.jpg'),
    additional_image_link: [img('FilmRaid-8_back.jpg')],
    price: eur(5779),
    brand: 'FilmRAID',
    mpn: 'FR-8-22',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },

  // 12E
  {
    id: 'FR-12E-18',
    title: 'FilmRAID-12E – 18TB',
    description: desc12E,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-12E.jpg'),
    additional_image_link: [img('FilmRaid-12E_back.jpg')],
    price: eur(7589),
    brand: 'FilmRAID',
    mpn: 'FR-12E-18',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-12E-20',
    title: 'FilmRAID-12E – 20TB',
    description: desc12E,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-12E.jpg'),
    additional_image_link: [img('FilmRaid-12E_back.jpg')],
    price: eur(8129),
    brand: 'FilmRAID',
    mpn: 'FR-12E-20',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
  {
    id: 'FR-12E-22',
    title: 'FilmRAID-12E – 22TB',
    description: desc12E,
    link: `${ORIGIN}/catalog`,
    image_link: img('FilmRaid-12E.jpg'),
    additional_image_link: [img('FilmRaid-12E_back.jpg')],
    price: eur(8399),
    brand: 'FilmRAID',
    mpn: 'FR-12E-22',
    condition: 'new',
    availability: 'in stock',
    google_product_category:
      'Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drive Arrays',
    product_type: 'Storage > RAID Desktop',
  },
];

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function itemXml(it: Item) {
  const extra = (it.additional_image_link || [])
    .map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`)
    .join('');
  return `
    <item>
      <g:id>${esc(it.id)}</g:id>
      <g:title>${esc(it.title)}</g:title>
      <g:description>${esc(it.description)}</g:description>
      <g:link>${esc(it.link)}</g:link>
      <g:image_link>${esc(it.image_link)}</g:image_link>
      ${extra}
      <g:price>${it.price}</g:price>
      <g:availability>${it.availability}</g:availability>
      <g:condition>${it.condition}</g:condition>
      <g:brand>${esc(it.brand)}</g:brand>
      <g:mpn>${esc(it.mpn)}</g:mpn>
      <g:google_product_category>${esc(it.google_product_category || '')}</g:google_product_category>
      <g:product_type>${esc(it.product_type || '')}</g:product_type>
    </item>`;
}

function buildXml(items: Item[]) {
  const body = items.map(itemXml).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>FilmRAID Products</title>
    <link>${ORIGIN}</link>
    <description>RAID storage systems for film production and post workflows</description>
${body}
  </channel>
</rss>`;
}

export function GET() {
  const xml = buildXml(items);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
