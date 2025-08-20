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

  if (
    country === 'ES' ||
    [
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
    ].includes(country)
  ) {
    // DHL EU example flat (replace with API call for real)
    rates.push({
      id: 'dhl-eu',
      name: 'DHL EU (2-3 days)',
      cost: 50, // €, adjust based on weight
      minDeliveryDays: 2,
      maxDeliveryDays: 3,
    });
  } else {
    // FedEx international example flat (replace with API)
    rates.push({
      id: 'fedex-intl',
      name: 'FedEx Global (3-5 days)',
      cost: 100, // €, adjust
      minDeliveryDays: 3,
      maxDeliveryDays: 5,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
