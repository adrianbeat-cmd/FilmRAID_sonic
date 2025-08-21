// @ts-nocheck
exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const content = data.content;
  const shippingAddress = content.shippingAddress || {};
  const items = content.items || [];

  let rates = [];

  if (
    [
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
    ].includes(shippingAddress.country)
  ) {
    rates.push({ description: 'DHL Express (EU)', cost: 50, guaranteedDaysToDelivery: 2 });
  } else {
    rates.push({ description: 'FedEx International', cost: 100, guaranteedDaysToDelivery: 5 });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
