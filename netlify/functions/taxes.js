// netlify/functions/taxes.js
// Node 18+ CommonJS Netlify Function
// Snipcart "Calculate taxes" webhook handler

/** Basic EU VAT format check (no online VIES lookup here) */
const isValidVatFormat = (value = '') => {
  const v = String(value).trim().replace(/\s+/g, '');
  // 2 letters (country) + 8–12 alphanumeric
  return /^[A-Z]{2}[A-Z0-9]{8,12}$/i.test(v);
};

/** EU country codes */
const EU_COUNTRIES = new Set([
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

/** Safely extract a (decimal) "taxable amount" from the payload */
const getTaxableAmount = (payload) => {
  // Try Snipcart’s usual structure
  const content = payload?.content || payload || {};
  const items = content.items || [];

  // Prefer "totalPrice" if present; else fallback to price*quantity
  const itemsTotal = items.reduce((sum, it) => {
    const line =
      typeof it.totalPrice === 'number'
        ? it.totalPrice
        : (Number(it.price) || 0) * (Number(it.quantity) || 0);
    return sum + line;
  }, 0);

  // Shipping if present
  const shippingCost = Number(content?.shipping?.cost || content?.shippingFees || 0) || 0;

  // Discounts if provided as a total number
  const discount = Number(content?.discountsTotal || content?.discountTotal || 0) || 0;

  const subtotal = Math.max(0, itemsTotal + shippingCost - discount);
  return subtotal;
};

/** Pull VAT number from custom field "vatNumber" (billing) */
const getVatNumber = (payload) => {
  const content = payload?.content || payload || {};
  // 1) From our explicit custom billing field id="vatNumber"
  const billingVat = content?.billingAddress?.vatNumber;
  if (billingVat) return billingVat;

  // 2) Sometimes Snipcart puts custom fields in arrays
  const customFields =
    content?.billingAddress?.customFields ||
    content?.customFields ||
    content?.invoice?.customFields ||
    [];

  const byName =
    customFields.find((f) => {
      const n = (f?.name || f?.id || '').toString().toLowerCase();
      return n === 'vatnumber' || n === 'vat' || n === 'eu vat number';
    }) || {};

  return byName?.value || '';
};

/** Get ISO country code from billing (preferred) or shipping */
const getCountry = (payload) => {
  const content = payload?.content || payload || {};
  const bCountry = (content?.billingAddress?.country || '').toUpperCase();
  if (bCountry) return bCountry;
  const sCountry = (content?.shippingAddress?.country || '').toUpperCase();
  return sCountry || '';
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const payload = JSON.parse(event.body || '{}');
    const country = getCountry(payload);
    const vatNumber = getVatNumber(payload);
    const taxableAmount = getTaxableAmount(payload);

    // Default: no taxes
    let rate = 0;
    let name = 'VAT';

    // Spain (ES) -> 21%
    if (country === 'ES') {
      rate = 0.21;
      name = 'VAT (ES 21%)';
    }
    // EU (not ES)
    else if (EU_COUNTRIES.has(country)) {
      if (isValidVatFormat(vatNumber) && country !== 'ES') {
        // Reverse charge for EU businesses outside Spain with VAT
        rate = 0;
        name = 'EU Reverse Charge (Valid VAT)';
      } else {
        // No valid VAT -> apply 21% (simplified)
        rate = 0.21;
        name = 'VAT (EU, no VAT provided)';
      }
    }
    // Non-EU -> 0%
    else {
      rate = 0;
      name = 'No VAT (non-EU)';
    }

    const amount = Number((taxableAmount * rate).toFixed(2));

    /** Snipcart expects: { taxes: [{ name, amount }] }
     *  Amount is in the same currency units as prices (e.g., EUR).
     */
    const response = {
      taxes: rate > 0 ? [{ name, amount }] : [],
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error('Taxes function error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
