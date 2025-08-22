exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const cart = payload.content || {};
    const addr = cart.shippingAddress || cart.billingAddress || {};

    // Minimal guard: only reply when we have a country & postal code
    const hasAddress = !!(addr.country && addr.postalCode);

    // Compute grams from items; default to 8000g if missing
    const items = Array.isArray(cart.items) ? cart.items : [];
    const weight =
      items.reduce((sum, it) => {
        const w = Number(it?.weight) || 0;
        const q = Number(it?.quantity) || 1;
        return sum + w * q;
      }, 0) || 8000;

    // Basic EU flat table (in cents)
    const isEU = [
      'AT',
      'BE',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IE',
      'IT',
      'LV',
      'LT',
      'LU',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SK',
      'SI',
      'ES',
      'SE',
    ].includes((addr.country || '').toUpperCase());

    const base = isEU ? 1999 : 3999; // €19.99 EU, €39.99 rest of world
    const heavySurcharge = weight > 20000 ? (isEU ? 1500 : 3000) : 0; // >20kg

    const rate = {
      cost: base + heavySurcharge, // integer (cents)
      description: 'Tracked shipping', // label
      guaranteedDaysToDelivery: isEU ? 3 : 7,
    };

    // ALWAYS return at least one rate when we have an address
    const rates = hasAddress ? [rate] : [];

    return {
      statusCode: 200,
      body: JSON.stringify({ rates }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ rates: [{ cost: 2999, description: 'Standard shipping' }] }),
    };
  }
};
