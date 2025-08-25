// netlify/functions/taxes.js
const EU = new Set([
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
]);

function ok(obj) {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') return ok({ ok: true, info: 'tax function alive' });

  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const content = body?.content || body || {};

    // Addresses (prefer shipping; fallback billing)
    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '').toUpperCase();

    // Cart numbers
    const itemsTotal = Number(content.itemsTotal ?? content.cart?.itemsTotal ?? 0) || 0;
    const shippingFees =
      Number(content.shippingInformation?.fees ?? content.cart?.shippingInformation?.fees ?? 0) ||
      0;

    // Read customFields.vatNumber (object or array)
    const cf = content.customFields || content.cart?.customFields || {};
    let vatNumber = '';
    if (Array.isArray(cf)) {
      vatNumber = cf.find((f) => (f?.name || f?.key) === 'vatNumber')?.value || '';
    } else if (cf && typeof cf === 'object') {
      vatNumber = cf.vatNumber || '';
    }
    vatNumber = String(vatNumber || '')
      .replace(/\s+/g, '')
      .toUpperCase();

    if (!country) return ok({ taxes: [] });

    const isEU = EU.has(country);

    // Validate VAT only for EU (non-ES)
    let validVat = false;
    if (isEU && country !== 'ES' && /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber)) {
      try {
        const r = await fetch(
          `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
        );
        const j = await r.json();
        validVat = !!j.valid;
      } catch {
        validVat = false; // fail closed (charge VAT)
      }
    }

    // Rules
    let rate = 0;
    if (country === 'ES') {
      rate = 0.21;
    } else if (isEU) {
      rate = validVat ? 0 : 0.21;
    } else {
      rate = 0;
    }

    // Compute amount (VAT applies on shipping in EU)
    const base = itemsTotal + shippingFees;
    const amount = Math.round(base * rate * 100) / 100;

    const taxes =
      rate > 0
        ? [
            {
              name: rate === 0.21 ? 'VAT 21%' : 'VAT',
              rate, // percentage
              amount, // absolute (forces UI refresh)
              appliesOnShipping: true,
              includedInPrice: false,
              numberForInvoice: 'ES-IVA',
            },
          ]
        : [];

    return ok({ taxes });
  } catch (e) {
    return ok({ taxes: [] });
  }
};
