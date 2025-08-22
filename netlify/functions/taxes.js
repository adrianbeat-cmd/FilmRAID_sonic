// netlify/functions/taxes.js
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || {};

    const billing = content.billingAddress || {};
    const shipping = content.shippingAddress || {};
    const country = (billing.country || shipping.country || 'ES').toUpperCase();

    // 1) try native VAT fields first
    let vatNumber = billing.vatNumber || shipping.vatNumber || '';

    // 2) parse customFieldsJson if present (Snipcart v3 often sends this)
    if (
      !vatNumber &&
      typeof content.customFieldsJson === 'string' &&
      content.customFieldsJson.trim()
    ) {
      try {
        const arr = JSON.parse(content.customFieldsJson);
        if (Array.isArray(arr)) {
          const v = arr.find(
            (f) =>
              String(f.Name || '').toLowerCase() === 'vatnumber' ||
              String(f.Name || '').toLowerCase() === 'vat number',
          );
          if (v && v.Value) vatNumber = String(v.Value).trim();
        }
      } catch (e) {
        console.warn('Could not parse customFieldsJson:', e);
      }
    }

    // 3) as a last resort, scan items' customFields (rare in taxes hook)
    if (!vatNumber && Array.isArray(content.items)) {
      for (const it of content.items) {
        if (Array.isArray(it.customFields)) {
          const f = it.customFields.find(
            (cf) =>
              String(cf.name || '').toLowerCase() === 'vatnumber' ||
              String(cf.name || '').toLowerCase() === 'vat number',
          );
          if (f && f.value) {
            vatNumber = String(f.value).trim();
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
    let taxName = 'IVA Spain (21%)';

    if (country === 'ES') {
      rate = 0.21;
      taxName = 'IVA Spain (21%)';
    } else if (euCountries.includes(country)) {
      if (vatNumber) {
        // Use the runtime's global fetch (Node 18+ on Netlify)
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
            taxName = 'Invalid VAT — standard VAT (21%)';
          }
        } catch (e) {
          console.error('VAT API call failed:', e);
          rate = 0.21;
          taxName = 'VAT (21%)';
        }
      } else {
        rate = 0.21;
        taxName = 'EU B2C VAT (21%)';
      }
    } else {
      // Export outside EU — no VAT
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
