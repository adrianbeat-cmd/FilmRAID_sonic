// netlify/functions/taxes.js
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');

    // Try multiple paths defensively
    const customer = payload.customer || payload?.content?.customer || {};
    const billing =
      customer.billingAddress || payload?.billingAddress || payload?.content?.billingAddress || {};

    const country =
      billing.country ||
      customer?.shippingAddress?.country ||
      payload?.shippingAddress?.country ||
      'ES';

    // vatNumber may come from native field or custom field
    let vatNumber = billing.vatNumber || customer?.vatNumber || payload?.vatNumber || '';

    // If templates put vatNumber as a custom field in the cart (edge case)
    if (!vatNumber && Array.isArray(payload?.items)) {
      for (const it of payload.items) {
        if (Array.isArray(it.customFields)) {
          const f = it.customFields.find(
            (cf) =>
              String(cf.name || '').toLowerCase() === 'vatnumber' ||
              String(cf.name || '').toLowerCase() === 'vat number',
          );
          if (f && f.value) {
            vatNumber = f.value;
            break;
          }
        }
      }
    }

    console.log('Taxes webhook country:', country, 'vatNumber:', vatNumber);

    const euCountries = [
      'AT',
      'BE',
      'BG',
      'CY',
      'CZ',
      'DE',
      'DK',
      'EE',
      'FI',
      'FR',
      'GR',
      'HR',
      'HU',
      'IE',
      'IT',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SE',
      'SI',
      'SK',
      'ES',
    ];

    let rate = 0.21;
    let taxName = 'IVA (21%)';

    if (country === 'ES') {
      rate = 0.21;
      taxName = 'IVA Spain (21%)';
    } else if (euCountries.includes(country)) {
      if (vatNumber) {
        try {
          const res = await fetch(
            `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(vatNumber)}`,
          );
          const data = await res.json();
          console.log('VAT validate:', data);

          if (data && data.valid) {
            rate = 0.0;
            taxName = 'Intra-EU VAT Exempt';
          } else {
            rate = 0.21;
            taxName = 'Invalid VAT — standard IVA (21%)';
          }
        } catch (e) {
          console.error('VAT API error:', e);
          rate = 0.21;
          taxName = 'IVA (21%)';
        }
      } else {
        rate = 0.21;
        taxName = 'EU B2C VAT (21%)';
      }
    } else {
      rate = 0.0;
      taxName = 'No VAT (Export)';
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        taxes: [
          {
            name: taxName,
            rate,
            appliesTo: { country },
          },
        ],
      }),
    };
  } catch (error) {
    console.error('Taxes function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Tax calculation failed' }),
    };
  }
};
