// @ts-nocheck
exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const content = data.content;

  const billingCountry = content.billingAddress.country;
  const customFields = content.customFields || [];
  const vatField = customFields.find((f) => f.name === 'vatNumber');

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

  if (euCountries.includes(billingCountry)) {
    if (billingCountry === 'ES') {
      rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }];
    } else if (vatField && vatField.value) {
      try {
        const response = await fetch(`https://api.vatcomply.com/vat?vat_number=${vatField.value}`);
        const json = await response.json();
        if (json.valid) {
          rates = []; // 0% for valid intra-EU B2B
        } else {
          rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }];
        }
      } catch (error) {
        // Fail-safe: charge tax if validation errors
        rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }];
      }
    } else {
      rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }]; // EU B2C
    }
  } // Non-EU: no tax

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
