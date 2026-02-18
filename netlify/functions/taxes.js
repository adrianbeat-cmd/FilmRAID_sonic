// netlify/functions/taxes.js
const JSON_HEADERS = { 'content-type': 'application/json' };

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
    headers: JSON_HEADERS,
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') return ok({ ok: true, info: 'tax function alive' });
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    const content = body?.content || body || {};

    // Country (shipping first, then billing)
    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '')
      .toUpperCase()
      .trim();

    console.info('[taxes] Received country:', country);

    // VAT number
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

    console.info('[taxes] VAT number received:', vatNumber || '(empty)');

    if (!country) {
      console.info('[taxes] No country yet → returning empty taxes');
      return ok({ taxes: [] });
    }

    const isEU = EU.has(country);

    // Rate logic
    let rate = 0;
    let label = 'VAT';

    if (country === 'ES') {
      rate = 0.21;
      label = 'IVA (21%)';
    } else if (isEU) {
      const hasValidVat = vatNumber.length > 4 && /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber);
      rate = hasValidVat ? 0 : 0.21;
      label = hasValidVat ? 'VAT (reverse charge)' : 'VAT (21%)';
    } else {
      rate = 0;
      label = 'VAT (0%)';
    }

    // Calculate amount (items + shipping)
    const itemsTotal = Number(content.itemsTotal ?? content.cart?.itemsTotal ?? 0) || 0;
    const shippingFees =
      Number(content.shippingInformation?.fees ?? content.cart?.shippingInformation?.fees ?? 0) ||
      0;
    const base = itemsTotal + shippingFees;
    const amount = Math.round(base * rate * 100) / 100;

    console.info(`[taxes] ${country} → ${label} = ${amount}€ (rate ${rate})`);

    return ok({
      taxes: [
        {
          name: label,
          rate: rate,
          amount: amount,
          appliesOnShipping: true,
          includedInPrice: false,
          numberForInvoice: country === 'ES' ? 'ES-IVA' : 'EU-VAT',
        },
      ],
    });
  } catch (err) {
    console.error('[taxes] Error:', err);
    return ok({ taxes: [] });
  }
};
