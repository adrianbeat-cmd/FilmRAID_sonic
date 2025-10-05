// app/products-feed.xml/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const SITE = 'https://www.filmraid.pro';

type ModelKey = '4A' | '6' | '8' | '12E';
type TB = 18 | 20 | 22;

// Exact shipping weights (kg)
const WEIGHT_KG: Record<ModelKey, number> = {
  '4A': 8,
  '6': 12,
  '8': 18,
  '12E': 22,
};

// Prices
const PRICE: Record<ModelKey, Record<TB, number>> = {
  '4A': { 18: 2949, 20: 3129, 22: 3219 },
  '6': { 18: 4279, 20: 4549, 22: 4679 },
  '8': { 18: 5239, 20: 5599, 22: 5779 },
  '12E': { 18: 7589, 20: 8129, 22: 8399 },
};

// Titles per model
const MODEL_TITLE: Record<ModelKey, string> = {
  '4A': 'FilmRAID-4A',
  '6': 'FilmRAID-6',
  '8': 'FilmRAID-8',
  '12E': 'FilmRAID-12E',
};

// Capacity labels per model/TB (what appears in product title)
const CAPACITY_LABEL: Record<ModelKey, Record<TB, string>> = {
  '4A': { 18: '72TB', 20: '80TB', 22: '88TB' },
  '6': { 18: '108TB', 20: '120TB', 22: '132TB' },
  '8': { 18: '144TB', 20: '160TB', 22: '176TB' },
  '12E': { 18: '216TB', 20: '240TB', 22: '264TB' },
};

// Slugs you provided
const SLUGS: Record<ModelKey, Record<TB, string>> = {
  '4A': { 18: 'filmraid-4a-72tb', 20: 'filmraid-4a-80tb', 22: 'filmraid-4a-88tb' },
  '6': { 18: 'filmraid-6-108tb', 20: 'filmraid-6-120tb', 22: 'filmraid-6-132tb' },
  '8': { 18: 'filmraid-8-144tb', 20: 'filmraid-8-160tb', 22: 'filmraid-8-176tb' },
  '12E': { 18: 'filmraid-12e-216tb', 20: 'filmraid-12e-240tb', 22: 'filmraid-12e-264tb' },
};

// Main images (one per model)
const IMAGE: Record<ModelKey, string> = {
  '4A': `${SITE}/layout/FilmRAID-4A.jpg`,
  '6': `${SITE}/layout/FilmRAID-6.jpg`,
  '8': `${SITE}/layout/FilmRAID-8.jpg`,
  '12E': `${SITE}/layout/FilmRAID-12E.jpg`,
};

const TB_VALUES: TB[] = [18, 20, 22];
const MODELS: ModelKey[] = ['4A', '6', '8', '12E'];

function productUrl(model: ModelKey, tb: TB) {
  return `${SITE}/products/${SLUGS[model][tb]}`;
}

function makeDescription(model: ModelKey, tb: TB) {
  const capacity = CAPACITY_LABEL[model][tb];
  return `${MODEL_TITLE[model]} – ${capacity}. Fast, reliable RAID for film workflows. Assembled in EU.`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildItem(model: ModelKey, tb: TB) {
  const id = `FR-${model}-${tb}`;
  const title = `${MODEL_TITLE[model]} – ${CAPACITY_LABEL[model][tb]}`;
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
