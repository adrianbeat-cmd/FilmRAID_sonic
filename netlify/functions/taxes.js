exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const cart = payload.content || {};
    const country = (
      cart?.billingAddress?.country ||
      cart?.shippingAddress?.country ||
      ''
    ).toUpperCase();

    // 1) from billing
    let vatNumber = cart?.billingAddress?.vatNumber || '';

    // 2) from custom fields JSON (stringified)
    if (!vatNumber && typeof cart?.customFieldsJson === 'string') {
      try {
        const arr = JSON.parse(cart.customFieldsJson);
        const found = Array.isArray(arr)
          ? arr.find((f) => (f.Name || f.name) === 'vatNumber')
          : null;
        vatNumber = (found?.Value || found?.value || '').trim();
      } catch {}
    }

    // Very light “looks like EU VAT” check
    const vatLike = /^[A-Z]{2}[0-9A-Z]{8,12}$/i.test(vatNumber || '');

    // Your shop country (for domestic VAT). Change to your VAT country code.
    const shopCountry = 'ES';

    // Intra-EU B2B (valid VAT entered) => 0% VAT
    let rate = 0;
    if (country === shopCountry) {
      rate = 21; // ES standard VAT
    } else if (vatLike) {
      rate = 0;
    } else if (country) {
      // Intra-EU B2C fallback — set a simple default if you prefer
      rate = 21; // keep simple for now
    }

    // Snipcart expects amounts in cents
    const taxableTotal = Number(cart?.taxableTotal || cart?.itemsTotal || 0);
    const amount = Math.round((taxableTotal * rate) / 100);

    return {
      statusCode: 200,
      body: JSON.stringify({
        taxes:
          rate > 0
            ? [
                {
                  name: `VAT ${rate}%`,
                  amount,
                },
              ]
            : [],
      }),
    };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ taxes: [] }) };
  }
};
