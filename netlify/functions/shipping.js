// @ts-nocheck
exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const content = data.content;
  const shippingAddress = content.shippingAddress || {};
  const items = content.items || [];

  console.log('Shipping webhook called with:', { country: shippingAddress.country, items });

  let rates = [];

  // Calculate total weight (kg) and dims (cm) dynamically
  let totalWeight = 0;
  items.forEach((item) => {
    const model = item.name.split(' ')[0]; // e.g., FilmRaid-4A
    let baseWeight;
    switch (model) {
      case 'FilmRaid-4A':
        baseWeight = 3.6;
        break;
      case 'FilmRaid-6':
        baseWeight = 4.8;
        break;
      case 'FilmRaid-8':
        baseWeight = 5.2;
        break;
      default:
        baseWeight = 5; // Fallback
    }
    const hddCount = parseInt(model.split('-')[1]) || 4; // e.g., 4 from 4A
    const driveWeight = 0.7; // Per 18-22TB HDD
    totalWeight += (baseWeight + hddCount * driveWeight) * item.quantity;
  });

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
    rates.push({
      id: 'dhl-eu',
      cost: 50,
      description: 'DHL Express (EU)',
      guaranteedDaysToDelivery: 2,
    });
  } else {
    rates.push({
      id: 'fedex-int',
      cost: 100,
      description: 'FedEx International',
      guaranteedDaysToDelivery: 5,
    });
  }

  console.log('Returning rates:', rates);

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
