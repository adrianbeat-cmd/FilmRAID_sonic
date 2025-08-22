// netlify/functions/taxes.js
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const customer = payload?.customer || {};
    const country = customer?.billingAddress?.country || 'ES';
    const vatNumber = customer?.billingAddress?.vatNumber || '';

    console.log('Taxes webhook called with:', payload);

    // EU country codes
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

    let rate = 0.21; // default 21%
    let taxName = 'IVA (21%)';

    if (country === 'ES') {
      // Always charge IVA in Spain
      rate = 0.21;
      taxName = 'IVA Spain (21%)';
    } else if (euCountries.includes(country)) {
      if (vatNumber) {
        try {
          const res = await fetch(`https://api.vatcomply.com/vat?vat_number=${vatNumber}`);
          const data = await res.json();

          if (data.valid) {
            // Intra-EU B2B → 0%
            rate = 0.0;
            taxName = 'Intra-EU VAT Exempt';
          } else {
            // Invalid VAT → charge 21%
            rate = 0.21;
            taxName = 'Invalid VAT - Standard IVA (21%)';
          }
        } catch (err) {
          console.error('VAT API error:', err);
          // fallback: charge 21%
          rate = 0.21;
          taxName = 'IVA (21%)';
        }
      } else {
        // EU private customer → 21%
        rate = 0.21;
        taxName = 'EU B2C VAT (21%)';
      }
    } else {
      // Outside EU → no VAT
      rate = 0.0;
      taxName = 'No VAT (Export)';
    }

    const taxes = [
      {
        name: taxName,
        rate: rate,
        appliesTo: { country },
      },
    ];

    return {
      statusCode: 200,
      body: JSON.stringify({ taxes }),
    };
  } catch (error) {
    console.error('Taxes function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Tax calculation failed' }),
    };
  }
};
