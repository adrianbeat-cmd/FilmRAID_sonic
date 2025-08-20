document.addEventListener('snipcart.ready', function () {
  // Add VAT field to billing form
  Snipcart.api.theme.cart.addCustomField({
    name: 'vat_number',
    placeholder: 'e.g., ESB12345678',
    label: 'EU VAT Number (optional for B2C)',
    type: 'text',
    required: false,
    section: 'billing',
  });

  // Validate on billing page
  Snipcart.subscribe('page.validating', function (ev) {
    if (ev.type === 'billing-address') {
      const vatNumber = Snipcart.api.cart.getCustomFieldValue('vat_number');
      const country = Snipcart.api.cart.getBillingAddress().country;

      if (vatNumber && country !== 'ES') {
        const countryCode = vatNumber.substring(0, 2).toUpperCase();
        // Validate with free Abstract API (no key)
        fetch(
          `https://vat.abstractapi.com/v1/validate/?vat_number=${vatNumber}&country_code=${countryCode}`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (!data.is_valid_vat) {
              ev.addError('vat_number', 'Invalid EU VAT number.');
            } else {
              Snipcart.api.cart.update({ taxes: [] });
            }
          })
          .catch(() => {
            ev.addError('vat_number', 'Validation failed.');
          });
      }
    }
  });
});
