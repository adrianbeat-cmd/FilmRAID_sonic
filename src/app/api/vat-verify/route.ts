// /src/app/api/vat-verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // fast & cheap

type VatComplyResponse = {
  valid: boolean;
  query: { vat_number: string };
  format_valid?: boolean;
  country_code?: string;
  vat_number?: string;
  name?: string | null;
  address?: string | null;
};

function sanitize(vat: string): string {
  return vat.replace(/\s+/g, '').toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { vat } = (await req.json()) as { vat?: string };
    const value = sanitize(vat || '');

    if (!value || !/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(value)) {
      return NextResponse.json({ ok: true, valid: false, reason: 'format' });
    }

    const url = `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(value)}`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return NextResponse.json({ ok: false });

    const data = (await r.json()) as VatComplyResponse;

    return NextResponse.json({
      ok: true,
      valid: !!data.valid,
      name: data.name || '',
      address: data.address || '',
      country: data.country_code || value.slice(0, 2),
      vat: value,
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
