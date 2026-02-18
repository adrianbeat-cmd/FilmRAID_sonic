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
  return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') return ok({ ok: true });

  try {
    const body = JSON.parse(event.body || '{}');
    const content = body?.content || body || {};

    const shipping = content.shippingAddress || content.cart?.shippingAddress || {};
    const billing = content.billingAddress || content.cart?.billingAddress || {};
    const country = String(shipping.country || billing.country || '')
      .toUpperCase()
      .trim();

    console.info('[taxes] Country received:', country);

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

    console.info('[taxes] VAT number:', vatNumber || '(none)');

    if (!country) return ok({ taxes: [] });

    const isEU = EU.has(country);

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

    const itemsTotal = Number(content.itemsTotal ?? content.cart?.itemsTotal ?? 0) || 0;
    const shippingFees =
      Number(content.shippingInformation?.fees ?? content.cart?.shippingInformation?.fees ?? 0) ||
      0;
    const base = itemsTotal + shippingFees;
    const amount = Math.round(base * rate * 100) / 100;

    console.info(`[taxes] Final → ${label} = ${amount}€ (rate ${rate})`);

    return ok({
      taxes: [{ name: label, rate, amount, appliesOnShipping: true, includedInPrice: false }],
    });
  } catch (err) {
    console.error('[taxes] Error:', err);
    return ok({ taxes: [] });
  }
};
