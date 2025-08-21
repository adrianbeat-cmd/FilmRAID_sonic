// @ts-nocheck
exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const content = data.content;

  console.log('Taxes webhook called with:', {
    billingCountry: content.billingAddress.country,
    customFields: content.customFields,
  });

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
        console.log('VAT validation response:', json);
        if (json.valid) {
          rates = []; // 0% for valid intra-EU B2B
        } else {
          rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }];
        }
      } catch (error) {
        console.error('VAT validation error:', error);
        rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }];
      }
    } else {
      rates = [{ name: 'IVA', amount: 0.21, includedInPrice: false, appliesOnShipping: false }]; // EU B2C
    }
  } // Non-EU: no tax

  console.log('Returning rates:', rates);

  return {
    statusCode: 200,
    body: JSON.stringify({ rates }),
  };
};
