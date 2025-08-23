// src/app/api/vat-verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

const VIES_URL = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService';

function buildSoap(countryCode: string, vatNumber: string) {
  return `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Body>
        <tns:checkVat>
          <tns:countryCode>${countryCode}</tns:countryCode>
          <tns:vatNumber>${vatNumber}</tns:vatNumber>
        </tns:checkVat>
      </soap:Body>
    </soap:Envelope>
  `.trim();
}

// Extend RequestInit so we can use Next.js' "next" option without ts-ignore
type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    const { vat } = (await req.json()) as { vat?: string };
    if (!vat || typeof vat !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing vat' }, { status: 400 });
    }

    const cleaned = vat.replace(/\s+/g, '').toUpperCase();
    const cc = cleaned.slice(0, 2);
    const num = cleaned.slice(2);

    // quick sanity
    if (!/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(cleaned)) {
      return NextResponse.json({ ok: true, valid: false, reason: 'format' });
    }

    const init: NextFetchInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat',
      },
      body: buildSoap(cc, num),
      // ensure no caching
      next: { revalidate: 0 },
    };

    const res = await fetch(VIES_URL, init);
    const text = await res.text();

    // Naive parse for validity, name & address
    const valid = /<valid>\s*true\s*<\/valid>/i.test(text);
    const nameMatch = text.match(
      /<name>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/name>|<name>\s*(.*?)\s*<\/name>/i,
    );
    const addrMatch = text.match(
      /<address>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/address>|<address>\s*([\s\S]*?)\s*<\/address>/i,
    );

    const name = nameMatch ? (nameMatch[1] || nameMatch[2] || '').trim() : '';
    const addressRaw = addrMatch ? (addrMatch[1] || addrMatch[2] || '').trim() : '';
    const address = addressRaw.replace(/\s*\n\s*/g, ', ');

    return NextResponse.json({ ok: true, valid, name, address });
  } catch (e) {
    const err = e as Error;
    // VIES sometimes rate-limits or is down → treat as “unknown”
    return NextResponse.json({ ok: false, error: err.message || 'VIES error' }, { status: 200 });
  }
}
