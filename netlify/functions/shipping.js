// @ts-nocheck
exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const content = data.content;
  const shippingAddress = content.shippingAddress;
  const items = content.items;

  console.log('Shipping webhook called with:', { country: shippingAddress.country, items }); // Debug log

  // Calculate total weight (kg) and dims (cm) dynamically
  let totalWeight = 0;
  let dimensions = { length: 30, width: 25, height: 20 }; // Default box; adjust per model if needed
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

  let rates = [];

  // EU: DHL (replace with your API key/credentials once ready)
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
    try {
      const dhlResponse = await fetch('https://api-eu.dhl.com/shipment/rates', {
        // DHL rate API endpoint
        method: 'POST',
        headers: {
          Authorization: 'Bearer YOUR_DHL_API_KEY', // Replace
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: { countryCode: 'ES', postalCode: '08030', city: 'Barcelona' },
          destination: {
            countryCode: shippingAddress.country,
            postalCode: shippingAddress.postalCode,
            city: shippingAddress.city,
          },
          packages: [{ weight: totalWeight, dimensions }],
          // Add accountNumber if needed
        }),
      });
      const dhlData = await dhlResponse.json();
      rates.push({
        name: 'DHL Express (EU)',
        amount: dhlData.rates[0].totalNet.amount, // Adjust path per API response
        estimatedDays: 2,
      });
    } catch (error) {
      console.error('DHL error:', error);
      rates.push({ name: 'DHL Express (EU)', amount: 50, estimatedDays: 2 }); // Fallback flat rate
    }
  } else {
    // International: FedEx
    try {
      const fedexResponse = await fetch('https://apis.fedex.com/rate/v1/rates/quotes', {
        // FedEx rate API
        method: 'POST',
        headers: {
          Authorization: 'Bearer YOUR_FEDEX_API_KEY', // Replace
          'Content-Type': 'application/json',
          'X-locale': 'en_US',
        },
        body: JSON.stringify({
          accountNumber: { value: 'YOUR_FEDEX_ACCOUNT_NUMBER' }, // Replace
          requestedShipment: {
            shipper: { address: { postalCode: '08030', countryCode: 'ES', city: 'Barcelona' } },
            recipient: {
              address: {
                postalCode: shippingAddress.postalCode,
                countryCode: shippingAddress.country,
                city: shippingAddress.city,
              },
            },
            packageLineItems: [
              {
                weight: { units: 'KG', value: totalWeight },
                dimensions: { ...dimensions, units: 'CM' },
              },
            ],
            serviceType: 'INTERNATIONAL_PRIORITY', // Or ECONOMY
          },
        }),
      });
      const fedexData = await fedexResponse.json();
      rates.push({
        name: 'FedEx International',
        amount: fedexData.output.rateReplyDetails[0].ratedShipmentDetails[0].totalNetCharge.amount, // Adjust path
        estimatedDays: 3 - 5,
      });
    } catch (error) {
      console.error('FedEx error:', error);
      rates.push({ name: 'FedEx International', amount: 100, estimatedDays: 5 }); // Fallback
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
