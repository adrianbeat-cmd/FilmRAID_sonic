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

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');
    const content = body?.content || body || {};

    // shipping/billing can be on content or content.cart
    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '').toUpperCase();

    // customFields can be array or object, on content or content.cart
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

    // default: no taxes until we know the country
    if (!country) return ok({ taxes: [] });

    const isEU = EU.has(country);
    let validVat = false;

    // Validate VAT only for EU (non-ES) destinations
    if (isEU && country !== 'ES' && /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber)) {
      try {
        const r = await fetch(
          `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
        );
        const j = await r.json();
        validVat = !!j.valid;
      } catch {
        validVat = false; // fail closed (charge VAT) if service fails
      }
    }

    // Rules:
    // - Spain -> 21%
    // - Other EU -> 0% if valid VAT, else 21%
    // - Outside EU -> 0%
    let rate = 0;
    if (country === 'ES') {
      rate = 0.21;
    } else if (isEU) {
      rate = validVat ? 0 : 0.21;
    } else {
      rate = 0;
    }

    const taxes = rate > 0 ? [{ name: 'VAT', rate }] : [];
    return ok({ taxes });
  } catch (e) {
    // don't block checkout on errors
    return ok({ taxes: [] });
  }
};

function ok(obj) {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
