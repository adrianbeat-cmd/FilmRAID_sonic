// src/app/products-feed.xml/route.ts

export const dynamic = 'force-static'; // required for static export (Netlify "output: export")
// export const revalidate = 3600; // (optional) if you prefer ISR-style regeneration

type TB = 18 | 20 | 22;

const FEED_BASE = 'https://www.filmraid.pro';
const IMAGE_BASE = `${FEED_BASE}`; // files live under /public

type ModelCode = '4A' | '6' | '8' | '12E';

type Model = {
  code: ModelCode;
  nameBase: string; // "FilmRAID-4A"
  slug: string; // "filmraid-4a"
  // map "option TB" (18/20/22) -> marketed capacity in TB shown in URL/title
  tbMap: Record<TB, number>;
  // price per option TB
  prices: Record<TB, number>;
  // images under /public
  images: { main: string; back?: string };
};

const MODELS: Model[] = [
  {
    code: '4A',
    nameBase: 'FilmRAID-4A',
    slug: 'filmraid-4a',
    tbMap: { 18: 72, 20: 80, 22: 88 },
    prices: { 18: 2949, 20: 3129, 22: 3219 },
    images: { main: '/layout/FilmRaid-4A.jpg', back: '/layout/FilmRaid-4A_back.jpg' },
  },
  {
    code: '6',
    nameBase: 'FilmRAID-6',
    slug: 'filmraid-6',
    tbMap: { 18: 108, 20: 120, 22: 132 },
    prices: { 18: 4279, 20: 4549, 22: 4679 },
    images: { main: '/layout/FilmRaid-6.jpg', back: '/layout/FilmRaid-6_back.jpg' },
  },
  {
    code: '8',
    nameBase: 'FilmRAID-8',
    slug: 'filmraid-8',
    tbMap: { 18: 144, 20: 160, 22: 176 },
    prices: { 18: 5239, 20: 5599, 22: 5779 },
    images: { main: '/layout/FilmRaid-8.jpg', back: '/layout/FilmRaid-8_back.jpg' },
  },
  {
    code: '12E',
    nameBase: 'FilmRAID-12E',
    slug: 'filmraid-12e',
    tbMap: { 18: 216, 20: 240, 22: 264 },
    prices: { 18: 7589, 20: 8129, 22: 8399 },
    images: { main: '/layout/FilmRaid-12E.jpg', back: '/layout/FilmRaid-12E_back.jpg' },
  },
];

const TB_OPTIONS: TB[] = [18, 20, 22];

/** Build the canonical product URL for a given model + TB option */
function productUrl(model: Model, tbOpt: TB): string {
  const capacity = model.tbMap[tbOpt];
  return `${FEED_BASE}/products/${model.slug}-${capacity}tb`;
}

/** Basic HTML escape for XML content nodes */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Price to Google format: "1234.00 EUR" */
function priceStr(n: number): string {
  return `${n.toFixed(2)} EUR`;
}

export async function GET() {
  const now = new Date().toUTCString();

  // Build <item> entries (12 total)
  const itemsXml: string[] = [];

  for (const model of MODELS) {
    for (const tbOpt of TB_OPTIONS) {
      const capacityTB = model.tbMap[tbOpt];
      const id = `FR-${model.code}-${tbOpt}`; // e.g., FR-4A-18
      const title = `${model.nameBase} – ${capacityTB}TB`;
      const link = productUrl(model, tbOpt);
      const price = model.prices[tbOpt];

      const imageLink = `${IMAGE_BASE}${model.images.main}`;
      const addlImage = model.images.back ? `${IMAGE_BASE}${model.images.back}` : '';

      const description =
        `High-performance RAID for filmmakers. Pre-configured options and pro-grade drives. ` +
        `Ships from Barcelona. International shipping available (DAP).`;

      itemsXml.push(
        [
          `<item>`,
          `  <g:id>${esc(id)}</g:id>`,
          `  <title>${esc(title)}</title>`,
          `  <description>${esc(description)}</description>`,
          `  <link>${esc(link)}</link>`,
          `  <g:price>${priceStr(price)}</g:price>`,
          `  <g:availability>in_stock</g:availability>`,
          `  <g:condition>new</g:condition>`,
          `  <g:brand>FilmRAID</g:brand>`,
          `  <g:mpn>${esc(id)}</g:mpn>`,
          `  <g:image_link>${esc(imageLink)}</g:image_link>`,
          addlImage ? `  <g:additional_image_link>${esc(addlImage)}</g:additional_image_link>` : '',
          `</item>`,
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
  }

  // Wrap in RSS 2.0 + Google namespace
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>FilmRAID Product Feed</title>
    <link>${FEED_BASE}</link>
    <description>Official FilmRAID catalog feed</description>
    <lastBuildDate>${now}</lastBuildDate>
${itemsXml.join('\n')}
  </channel>
</rss>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
