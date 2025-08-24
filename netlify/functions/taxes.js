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

    // Snipcart sends { eventName, content: { ...cart-like... } }
    const content = body?.content || body || {};

    // Try both shapes: top-level and nested under .cart
    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};

    // Prefer shipping country; fall back to billing
    const country = String(shipping.country || billing.country || '').toUpperCase();

    // Extract custom field 'vatNumber' (array or object)
    let vatNumber = '';
    const cf = content.customFields || content.cart?.customFields || {};

    if (Array.isArray(cf)) {
      const hit = cf.find((f) => (f?.name || f?.key) === 'vatNumber');
      vatNumber = hit?.value || '';
    } else if (typeof cf === 'object' && cf) {
      vatNumber = cf.vatNumber || '';
    }

    // Normalize VAT
    vatNumber = String(vatNumber || '')
      .replace(/\s+/g, '')
      .toUpperCase();

    // Validate VAT only for EU; skip for non-EU (always 0%) and Spain (we charge 21% anyway)
    let validVat = false;
    const looksLikeVat = /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber);

    if (looksLikeVat && country && EU.has(country) && country !== 'ES') {
      try {
        const r = await fetch(
          `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
        );
        const j = await r.json();
        validVat = !!j.valid;
      } catch {
        validVat = false; // fail closed (charge VAT) if VIES is down
      }
    }

    // Decide rate
    const isEU = EU.has(country);
    let rate = 0;

    if (!country) {
      // No country yet: return no taxes to let checkout continue to address step
      return ok({ taxes: [] });
    }

    if (country === 'ES') {
      rate = 0.21; // Always charge Spanish IVA for ES destination
    } else if (isEU) {
      rate = validVat ? 0 : 0.21; // intra-EU B2B 0%, otherwise consumer 21%
    } else {
      rate = 0; // Rest of world: 0%
    }

    const taxes = rate > 0 ? [{ name: 'VAT', rate }] : [];
    return ok({ taxes });
  } catch (err) {
    // On error, don't block checkout—return no taxes
    return ok({ taxes: [] });
  }
};

// Helper
function ok(obj) {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
