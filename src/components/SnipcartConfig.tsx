'use client';

import { useEffect } from 'react';

const SnipcartConfig = () => {
  useEffect(() => {
    const handleSnipcartReady = () => {
      if (typeof window !== 'undefined' && window.Snipcart) {
        const snipcart = window.Snipcart;
        // Client-side validation for VAT (adds error if invalid; taxes handled server-side)
        snipcart.events.on('page.validating', async (ev) => {
          if (ev.type === 'billing-address') {
            const vatNumber = snipcart.api.cart.getCustomFieldValue('vatNumber');
            const billingAddress = snipcart.api.cart.getBillingAddress();
            const country = billingAddress.country;

            const euCountries = [
              'AT',
              'BE',
              'BG',
              'CY',
              'CZ',
              'DE',
              'DK',
              'EE',
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
            ]; // Exclude ES for zero-rate

            if (vatNumber && (euCountries.includes(country) || country === 'ES')) {
              try {
                const response = await fetch(
                  `https://api.vatcomply.com/vat?vat_number=${vatNumber}`,
                );
                const data = await response.json();
                if (!data.valid) {
                  ev.addError('vatNumber', 'Invalid EU VAT number. Leave blank for standard VAT.');
                }
              } catch {
                ev.addError('vatNumber', 'VAT validation failed. Try again.');
              }
            }
          }
        });

        // Show confirmation for valid VAT on field change
        snipcart.events.on('snipcart.ready', () => {
          const vatInput = document.querySelector('[name="vatNumber"]');
          if (vatInput) {
            vatInput.addEventListener('blur', async () => {
              const vatNumber = vatInput.value;
              const countrySelect = document.querySelector('[name="country"]');
              const country = countrySelect ? countrySelect.value : '';

              const euCountries = [
                'AT',
                'BE',
                'BG',
                'CY',
                'CZ',
                'DE',
                'DK',
                'EE',
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

              let messageEl = document.querySelector('#vat-message');
              if (!messageEl) {
                messageEl = document.createElement('span');
                messageEl.id = 'vat-message';
                messageEl.style.color = 'green';
                messageEl.style.fontSize = '0.875rem';
                messageEl.style.marginTop = '0.25rem';
                messageEl.style.display = 'block';
                vatInput.parentNode?.appendChild(messageEl);
              }

              if (vatNumber) {
                try {
                  const response = await fetch(
                    `https://api.vatcomply.com/vat?vat_number=${vatNumber}`,
                  );
                  const data = await response.json();
                  if (data.valid) {
                    if (country === 'ES') {
                      messageEl.textContent = 'Valid - IVA charged (local sale)';
                      messageEl.style.color = 'green';
                    } else if (euCountries.includes(country)) {
                      messageEl.textContent = 'Valid - 0% VAT applied (intra-EU B2B)';
                      messageEl.style.color = 'green';
                    } else {
                      messageEl.textContent = '';
                    }
                  } else {
                    messageEl.textContent = 'Invalid VAT number';
                    messageEl.style.color = 'red';
                  }
                } catch {
                  messageEl.textContent = 'Validation failed - try again';
                  messageEl.style.color = 'red';
                }
              } else {
                messageEl.textContent = '';
              }
            });
          }

          // Reorder VAT before checkbox
          const vatField = document
            .querySelector('.snipcart-form__field [name="vatNumber"]')
            ?.closest('.snipcart-form__field');
          const checkboxField = document
            .querySelector('.snipcart-form__field-checkbox [name="shipToBillingAddress"]')
            ?.closest('.snipcart-form__field-checkbox');

          if (vatField && checkboxField && checkboxField.parentNode) {
            checkboxField.parentNode.insertBefore(vatField, checkboxField.nextSibling);
          }
        });
      }
    };

    document.addEventListener('snipcart.ready', handleSnipcartReady);

    return () => {
      document.removeEventListener('snipcart.ready', handleSnipcartReady);
    };
  }, []);

  return null;
};

export default SnipcartConfig;
