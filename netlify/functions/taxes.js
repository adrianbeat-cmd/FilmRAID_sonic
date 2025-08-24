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

    // Snipcart sends different shapes depending on hook.
    const cart = body?.content?.cart || body?.cart || body?.content || {};

    const billing = cart.billingAddress || {};
    const country = String(billing.country || '').toUpperCase();

    // Extract custom field 'vatNumber' whether it’s an object map or an array
    let vatNumber = '';
    if (cart.customFields) {
      if (Array.isArray(cart.customFields)) {
        vatNumber = cart.customFields.find((f) => (f?.name || f?.key) === 'vatNumber')?.value || '';
      } else if (typeof cart.customFields === 'object') {
        vatNumber = cart.customFields.vatNumber || '';
      }
    }

    // Normalize VAT
    vatNumber = String(vatNumber || '')
      .replace(/\s+/g, '')
      .toUpperCase();

    // Server-side VIES check (only if looks like a VAT)
    let validVat = false;
    if (/^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber)) {
      try {
        const r = await fetch(
          `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
        );
        const j = await r.json();
        validVat = !!j.valid;
      } catch (_) {
        // If service is down, fall back to charging VAT unless ES not involved
        validVat = false;
      }
    }

    // Simple ES seller logic:
    // - ES destination: 21%
    // - EU (not ES) with valid VAT: 0%
    // - EU (not ES) without valid VAT: 21%
    // - Outside EU: 0%
    const isEU = EU.has(country);
    let rate = 0;

    if (country === 'ES') {
      rate = 0.21;
    } else if (isEU) {
      rate = validVat ? 0 : 0.21;
    } else {
      rate = 0;
    }

    const taxes = rate > 0 ? [{ name: 'VAT', rate }] : [];

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taxes }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taxes: [] }),
    };
  }
};
