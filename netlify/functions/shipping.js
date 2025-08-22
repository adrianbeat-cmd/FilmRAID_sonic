// netlify/functions/shipping.js

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const cart = payload.content || {};
    const totalWeight = Number(cart.totalWeight || 0);

    // Return at least one valid rate to avoid Snipcart 400s
    // You can customize these later (by country/weight/etc.)
    const rates = [
      { cost: 0, description: 'Free Shipping (EU)', guaranteed_days_to_delivery: 3 },
      { cost: 4900, description: 'Express Shipping', guaranteed_days_to_delivery: 2 },
    ];

    // Optional: if you only want to allow EU, uncomment below to block non-EU
    // const euCountries = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];
    // const shipCountry = cart?.shippingAddress?.country || cart?.billingAddress?.country;
    // if (shipCountry && !euCountries.includes(shipCountry)) {
    //   return { statusCode: 200, body: JSON.stringify({ rates: [] }) };
    // }

    // If weight is zero, still provide rates (some carts don’t set weight)
    return {
      statusCode: 200,
      body: JSON.stringify({ rates }),
    };
  } catch (err) {
    console.error('Shipping error:', err);
    return {
      statusCode: 200, // keep 200 so Snipcart doesn’t hard-fail UI
      body: JSON.stringify({ rates: [] }),
    };
  }
};
