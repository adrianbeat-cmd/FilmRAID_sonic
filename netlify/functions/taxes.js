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
  // Lightweight GET to verify the function is reachable from a browser
  if (event.httpMethod === 'GET') {
    return ok({ ok: true, info: 'tax function alive' });
  }

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');
    // Log once per invocation (shows in Netlify > Functions > taxes > Logs)
    console.log('[TAXES] incoming body keys:', Object.keys(body || {}));

    // Snipcart payload variations: body.content.{...} or nested under body.content.cart.{...}
    const content = body?.content || body || {};

    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '').toUpperCase();

    // Read vatNumber from customFields (array or object) at content or content.cart
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

    console.log('[TAXES] country:', country, 'vatNumber:', vatNumber);

    // If no country yet, return no taxes (Snipcart will call again after address is entered)
    if (!country) {
      console.log('[TAXES] no country yet -> taxes: []');
      return ok({ taxes: [] });
    }

    const isEU = EU.has(country);

    // Validate VAT only for EU (non-ES). Outside EU: 0% anyway. Spain: 21% anyway.
    let validVat = false;
    if (isEU && country !== 'ES' && /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber)) {
      try {
        const r = await fetch(
          `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
        );
        const j = await r.json();
        validVat = !!j.valid;
        console.log('[TAXES] VIES valid:', validVat, 'name:', j.name || '');
      } catch (e) {
        console.log('[TAXES] VIES error:', e && e.message);
        validVat = false; // fail closed (charge VAT) if the service fails
      }
    }

    // Rules:
    // - ES destination -> 21%
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
    console.log('[TAXES] result:', taxes);
    return ok({ taxes });
  } catch (err) {
    console.log('[TAXES] error:', err && err.message);
    // Don’t block checkout
    return ok({ taxes: [] });
  }
};
