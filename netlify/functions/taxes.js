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
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    const content = body?.content || body || {};

    // Prefer shipping, fallback billing
    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '').toUpperCase();

    // Totals
    const itemsTotal = Number(content.itemsTotal ?? content.cart?.itemsTotal ?? 0) || 0;
    const shippingFees =
      Number(content.shippingInformation?.fees ?? content.cart?.shippingInformation?.fees ?? 0) ||
      0;

    // VAT number from custom fields (object or array)
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

    // If country not chosen yet → let UI show placeholder
    if (!country) return ok({ taxes: [] });

    const isEU = EU.has(country);

    // Validate VAT only for EU (non-ES) - regex only
    let validVat = false;
    if (isEU && country !== 'ES' && /^[A-Z]{2}[A-Z0-9]{8,14}$/.test(vatNumber)) {
      validVat = true;
    }

    // Rate logic
    let rate = 0;
    if (country === 'ES') {
      rate = 0.21;
    } else if (isEU) {
      rate = validVat ? 0 : 0.21;
    } else {
      rate = 0;
    }

    // Base and amount (VAT applies on shipping in EU)
    const base = itemsTotal + shippingFees;
    const amount = Math.round(base * rate * 100) / 100;

    // Region label
    let baseLabel = 'Taxes';
    if (country === 'ES') baseLabel = 'IVA';
    else if (isEU) baseLabel = 'VAT';

    const label = rate > 0 ? `${baseLabel} (${Math.round(rate * 100)}%)` : baseLabel;

    return ok({
      taxes: [
        {
          name: label,
          rate,
          amount,
          appliesOnShipping: true,
          includedInPrice: false,
          numberForInvoice: 'ES-IVA',
        },
      ],
    });
  } catch {
    return ok({ taxes: [] });
  }
};
