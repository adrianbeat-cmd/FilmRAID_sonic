// netlify/functions/shipping.js
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const content = payload.content || {};
    const shippingAddress = content.shippingAddress || {};
    const billingAddress = content.billingAddress || {};
    const country = (shippingAddress.country || billingAddress.country || 'ES').toUpperCase();

    // Items can live at content.items for shippingrates.fetch
    const items = Array.isArray(content.items) ? content.items : [];

    // Map weights per Adri’s table (kg)
    const weightMap = [
      { match: /filmraid-4a/i, kg: 8.0 },
      { match: /filmraid-6\b/i, kg: 12.0 },
      { match: /filmraid-8\b/i, kg: 18.0 },
      // 12E ships in two boxes: 10 + 12 = 22kg
      { match: /filmraid-12e/i, kg: 22.0 },
    ];

    const getItemKg = (item) => {
      const key = (item?.id || item?.name || '').toString();
      for (const row of weightMap) {
        if (row.match.test(key)) return row.kg;
      }
      return 8.0; // default minimal RAID if no match
    };

    let totalWeight = 0;
    for (const it of items) {
      const q = Number(it.quantity || 1);
      totalWeight += getItemKg(it) * q;
    }

    console.log('Shipping webhook called with:', JSON.stringify(payload, null, 2));
    console.log('Calculated totalWeight:', totalWeight);

    // Build simple flat rates so the flow always continues
    const inEU = [
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
    ].includes(country);

    const rates = [];
    if (inEU) {
      // Scale a bit with weight to be realistic
      const cost = totalWeight <= 12 ? 35 : totalWeight <= 22 ? 50 : 65;
      rates.push({
        userDefinedId: 'dhl-eu',
        description: 'DHL Express (EU)',
        cost,
        guaranteedDaysToDelivery: 2,
      });
    } else {
      const cost = totalWeight <= 12 ? 85 : totalWeight <= 22 ? 120 : 160;
      rates.push({
        userDefinedId: 'fedex-intl',
        description: 'FedEx International',
        cost,
        guaranteedDaysToDelivery: 3,
      });
    }

    // Always return at least one rate to avoid Snipcart “carrier” error
    return {
      statusCode: 200,
      body: JSON.stringify({ rates }),
    };
  } catch (err) {
    console.error('Shipping error:', err);
    return {
      statusCode: 200,
      body: JSON.stringify({
        rates: [
          {
            userDefinedId: 'fallback',
            description: 'Standard Shipping',
            cost: 49,
            guaranteedDaysToDelivery: 5,
          },
        ],
      }),
    };
  }
};
