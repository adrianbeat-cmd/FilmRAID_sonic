export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hora (ajústalo si quieres)

// src/app/products-feed.xml/route.ts
import { NextResponse } from 'next/server';

// ⚙️ Ajusta si publicas en otro dominio/entorno:
const BASE_URL = 'https://www.filmraid.pro';

// 🖼️ Rutas a imágenes (sirven desde /public/layout/*)
const IMG = {
  'FilmRaid-4A': {
    main: `${BASE_URL}/layout/FilmRaid-4A.jpg`,
    back: `${BASE_URL}/layout/FilmRaid-4A_back.jpg`,
  },
  'FilmRaid-6': {
    main: `${BASE_URL}/layout/FilmRaid-6.jpg`,
    back: `${BASE_URL}/layout/FilmRaid-6_back.jpg`,
  },
  'FilmRaid-8': {
    main: `${BASE_URL}/layout/FilmRaid-8.jpg`,
    back: `${BASE_URL}/layout/FilmRaid-8_back.jpg`,
  },
  'FilmRaid-12E': {
    main: `${BASE_URL}/layout/FilmRaid-12E.jpg`,
    back: `${BASE_URL}/layout/FilmRaid-12E_back.jpg`,
  },
} as const;

// 💶 Precios confirmados (orden: 72/80/88 • 108/120/132 • 144/160/176 • 216/240/264)
const PRICES_EUR = {
  'FilmRaid-4A': [2949, 3129, 3219],
  'FilmRaid-6': [4279, 4549, 4679],
  'FilmRaid-8': [5239, 5599, 5779],
  'FilmRaid-12E': [7589, 8129, 8399],
} as const;

// 📦 Capacidades por modelo (coinciden en orden con los arrays de precio)
const CAPACITIES_TB = {
  'FilmRaid-4A': [72, 80, 88],
  'FilmRaid-6': [108, 120, 132],
  'FilmRaid-8': [144, 160, 176],
  'FilmRaid-12E': [216, 240, 264],
} as const;

// URL de producto (ajústalo a tu página de detalle si la tienes)
function productLink(model: string, tb: number) {
  // Si tienes página /catalog, cámbialo por: `${BASE_URL}/catalog?model=${...}&tb=${...}`
  return `${BASE_URL}/?model=${encodeURIComponent(model)}&tb=${encodeURIComponent(String(tb))}`;
}

function moneyEUR(n: number) {
  // Google requiere formato "1234.00 EUR"
  return `${n.toFixed(2)} EUR`;
}

function esc(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

type ModelKey = keyof typeof PRICES_EUR;

function buildItems() {
  const items: {
    id: string;
    title: string;
    description: string;
    link: string;
    image_link: string;
    additional_image_link?: string;
    price: string;
    availability: 'in_stock' | 'out_of_stock' | 'preorder';
    condition: 'new';
    brand: string;
    item_group_id: string;
    capacity: string;
    mpn?: string;
  }[] = [];

  (Object.keys(PRICES_EUR) as ModelKey[]).forEach((model) => {
    const prices = PRICES_EUR[model];
    const tbs = CAPACITIES_TB[model];
    const groupId = model; // mismo grupo por modelo

    prices.forEach((p, i) => {
      const tb = tbs[i];
      const id = `${model}-${tb}TB`.replace(/\s+/g, '');
      const title = `${model} — ${tb}TB`;
      const description =
        `${model} desktop RAID para cine digital. ` +
        `Configuraciones profesionales, garantía y soporte. ` +
        `Envío internacional disponible (DAP fuera de la UE).`;

      items.push({
        id,
        title,
        description,
        link: productLink(model, tb),
        image_link: IMG[model].main,
        additional_image_link: IMG[model].back,
        price: moneyEUR(p),
        availability: 'in_stock',
        condition: 'new',
        brand: 'FilmRAID',
        item_group_id: groupId,
        capacity: `${tb} TB`,
        mpn: id, // opcional; mantiene unicidad por variante
      });
    });
  });

  return items;
}

function toXml(items: ReturnType<typeof buildItems>) {
  const lines: string[] = [];

  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(`<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>`);
  lines.push(`<title>FilmRAID Products</title>`);
  lines.push(`<link>${BASE_URL}</link>`);
  lines.push(`<description>High-performance RAID for filmmakers</description>`);

  for (const it of items) {
    lines.push(`<item>`);
    lines.push(`<g:id>${esc(it.id)}</g:id>`);
    lines.push(`<title>${esc(it.title)}</title>`);
    lines.push(`<description>${esc(it.description)}</description>`);
    lines.push(`<link>${esc(it.link)}</link>`);
    lines.push(`<g:image_link>${esc(it.image_link)}</g:image_link>`);
    if (it.additional_image_link) {
      lines.push(
        `<g:additional_image_link>${esc(it.additional_image_link)}</g:additional_image_link>`,
      );
    }
    lines.push(`<g:price>${esc(it.price)}</g:price>`);
    lines.push(`<g:availability>${it.availability}</g:availability>`);
    lines.push(`<g:condition>${it.condition}</g:condition>`);
    lines.push(`<g:brand>${esc(it.brand)}</g:brand>`);
    lines.push(`<g:item_group_id>${esc(it.item_group_id)}</g:item_group_id>`);
    // Atributo de capacidad (no estándar de apparel, pero útil como info/segmentación)
    lines.push(`<g:capacity>${esc(it.capacity)}</g:capacity>`);
    if (it.mpn) lines.push(`<g:mpn>${esc(it.mpn)}</g:mpn>`);
    lines.push(`</item>`);
  }

  lines.push(`</channel></rss>`);
  return lines.join('');
}

export async function GET() {
  const items = buildItems();
  const xml = toXml(items);
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
