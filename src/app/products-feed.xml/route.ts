// app/products-feed.xml/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-static'; // requerido por Netlify export

// Datos base
const SITE = 'https://www.filmraid.pro';

type ModelKey = '4A' | '6' | '8' | '12E';
type TB = 18 | 20 | 22;

// Pesos (exactos, tomados de tu shipping.js / FedEx)
const WEIGHT_KG: Record<ModelKey, number> = {
  '4A': 8,
  '6': 12,
  '8': 18,
  '12E': 22,
};

// Precios (los que confirmaste)
const PRICE: Record<ModelKey, Record<TB, number>> = {
  '4A': { 18: 2949, 20: 3129, 22: 3219 },
  '6': { 18: 4279, 20: 4549, 22: 4679 },
  '8': { 18: 5239, 20: 5599, 22: 5779 },
  '12E': { 18: 7589, 20: 8129, 22: 8399 },
};

// Títulos legibles por modelo
const MODEL_TITLE: Record<ModelKey, string> = {
  '4A': 'FilmRAID-4A',
  '6': 'FilmRAID-6',
  '8': 'FilmRAID-8',
  '12E': 'FilmRAID-12E',
};

// Descripciones (puedes ajustar la copy si quieres)
function makeDescription(model: ModelKey, tb: TB) {
  const tbLabel: Record<TB, string> = { 18: '72TB', 20: '80TB', 22: '88TB' };
  const tbLabel6: Record<TB, string> = { 18: '108TB', 20: '120TB', 22: '132TB' };
  const tbLabel8: Record<TB, string> = { 18: '144TB', 20: '160TB', 22: '176TB' };
  const tbLabel12E: Record<TB, string> = { 18: '216TB', 20: '240TB', 22: '264TB' };

  let capacity = '';
  if (model === '4A') capacity = tbLabel[tb];
  else if (model === '6') capacity = tbLabel6[tb];
  else if (model === '8') capacity = tbLabel8[tb];
  else capacity = tbLabel12E[tb];

  return `${MODEL_TITLE[model]} – ${capacity}. Fast, reliable RAID for film workflows. Assembled in EU.`;
}

// Slugs exactos (los que nos diste)
function productUrl(model: ModelKey, tb: TB) {
  const slugs: Record<ModelKey, Record<TB, string>> = {
    '4A': {
      18: 'filmraid-4a-72tb',
      20: 'filmraid-4a-80tb',
      22: 'filmraid-4a-88tb',
    },
    '6': {
      18: 'filmraid-6-108tb',
      20: 'filmraid-6-120tb',
      22: 'filmraid-6-132tb',
    },
    '8': {
      18: 'filmraid-8-144tb',
      20: 'filmraid-8-160tb',
      22: 'filmraid-8-176tb',
    },
    '12E': {
      18: 'filmraid-12e-216tb',
      20: 'filmraid-12e-240tb',
      22: 'filmraid-12e-264tb',
    },
  };
  return `${SITE}/products/${slugs[model][tb]}`;
}

// Imágenes de producto principales (ajústalas si quieres variantes por TB)
const IMAGE: Record<ModelKey, string> = {
  '4A': `${SITE}/layout/FilmRaid-4A.jpg`,
  '6': `${SITE}/layout/FilmRaid-6.jpg`,
  '8': `${SITE}/layout/FilmRaid-8.jpg`,
  '12E': `${SITE}/layout/FilmRaid-12E.jpg`,
};

const TB_VALUES: TB[] = [18, 20, 22];
const MODELS: ModelKey[] = ['4A', '6', '8', '12E'];

function buildItem(model: ModelKey, tb: TB) {
  const id = `FR-${model}-${tb}`; // FR-4A-18, etc.
  const title = `${MODEL_TITLE[model]} – ${(() => {
    if (model === '4A') return ({ 18: '72TB', 20: '80TB', 22: '88TB' } as any)[tb];
    if (model === '6') return ({ 18: '108TB', 20: '120TB', 22: '132TB' } as any)[tb];
    if (model === '8') return ({ 18: '144TB', 20: '160TB', 22: '176TB' } as any)[tb];
    return ({ 18: '216TB', 20: '240TB', 22: '264TB' } as any)[tb];
  })()}`;

  const description = makeDescription(model, tb);
  const link = productUrl(model, tb);
  const image = IMAGE[model];
  const price = PRICE[model][tb];
  const weight = WEIGHT_KG[model];

  return `
  <item>
    <g:id>${id}</g:id>
    <title>${escapeXml(title)}</title>
    <g:description>${escapeXml(description)}</g:description>
    <link>${link}</link>
    <g:image_link>${image}</g:image_link>
    <g:availability>in stock</g:availability>
    <g:condition>new</g:condition>
    <g:brand>FilmRAID</g:brand>
    <g:mpn>${id}</g:mpn>
    <g:price>${price.toFixed(2)} EUR</g:price>
    <g:shipping_weight>${weight} kg</g:shipping_weight>
    <g:shipping_label>FILMRAID_MAIN</g:shipping_label>
  </item>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildFeed() {
  const items = MODELS.flatMap((m) => TB_VALUES.map((tb) => buildItem(m, tb))).join('\n');

  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>FilmRAID Product Feed</title>
    <link>${SITE}</link>
    <description>FilmRAID products for Google Merchant</description>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  const xml = buildFeed();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
