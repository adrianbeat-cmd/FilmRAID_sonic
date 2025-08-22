// netlify/functions/shipping.js
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const country = payload?.shippingAddress?.country || payload?.country || 'ES';
    const items = payload?.items || [];

    // Calculate total weight (fallback if item.weight is null)
    let totalWeight = 0;
    items.forEach((item) => {
      if (item.weight) {
        totalWeight += item.weight * (item.quantity || 1);
      } else {
        // fallback: approximate by model name
        if (item.name.includes('FilmRaid-4A')) totalWeight += 8;
        else if (item.name.includes('FilmRaid-6')) totalWeight += 12;
        else if (item.name.includes('FilmRaid-8')) totalWeight += 18;
        else if (item.name.includes('FilmRaid-12E')) totalWeight += 22;
        else totalWeight += 10; // default
      }
    });

    console.log('Shipping webhook called with:', payload);
    console.log('Calculated totalWeight:', totalWeight);

    // Simple EU check
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

    let rates = [];

    if (euCountries.includes(country)) {
      rates.push({
        userDefinedId: 'dhl-eu',
        cost: 50 + totalWeight * 2, // simple formula
        description: 'DHL Express (EU)',
        guaranteedDaysToDelivery: 2,
      });
    } else {
      rates.push({
        userDefinedId: 'fedex-intl',
        cost: 100 + totalWeight * 3,
        description: 'FedEx International',
        guaranteedDaysToDelivery: 5,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ rates }),
    };
  } catch (error) {
    console.error('Shipping function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Shipping rates calculation failed' }),
    };
  }
};
