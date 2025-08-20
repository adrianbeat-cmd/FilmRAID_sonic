// @ts-nocheck
exports.handler = async (event) => {
  if (!event.body) {
    return { statusCode: 200, body: JSON.stringify({ rates: [] }) };
  }

  const data = JSON.parse(event.body);
  const content = data.content;
  const country = content.shippingAddress.country;
  const totalWeight = content.items.reduce((sum, item) => sum + item.weight, 0) / 1000; // kg

  let rates = [];

  const euCountries = [
    'AT',
    'BE',
    'BG',
    'CY',
    'CZ',
    'DE',
    'DK',
    'EE',
    'ES',
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
  ];

  let cost = 50 + totalWeight * 10; // Base €50 + €10/kg; replace with API call
  if (euCountries.includes(country)) {
    rates.push({
      id: 'dhl-eu',
      name: 'DHL EU (2-3 days)',
      cost: cost,
      minDeliveryDays: 2,
      maxDeliveryDays: 3,
    });
  } else {
    cost = 100 + totalWeight * 15; // Higher for intl
    rates.push({
      id: 'fedex-intl',
      name: 'FedEx Global (3-5 days)',
      cost: cost,
      minDeliveryDays: 3,
      maxDeliveryDays: 5,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
