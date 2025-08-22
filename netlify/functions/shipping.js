// netlify/functions/shipping.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Snipcart expects { rates: [{ cost, description, guaranteed_days_to_delivery? }] }
    // Example: return flat rates by country or weight
    const shippingRates = [
      {
        cost: 0,
        description: 'Free Shipping (EU only)',
        guaranteed_days_to_delivery: 3,
      },
      {
        cost: 49,
        description: 'Express Shipping',
        guaranteed_days_to_delivery: 2,
      },
    ];

    return {
      statusCode: 200,
      body: JSON.stringify({ rates: shippingRates }),
    };
  } catch (error) {
    console.error('Shipping function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error calculating shipping rates' }),
    };
  }
};
