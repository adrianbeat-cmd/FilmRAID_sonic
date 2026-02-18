'use client';

import { useEffect } from 'react';

const SnipcartConfig = () => {
  useEffect(() => {
    const handleSnipcartReady = () => {
      if (typeof window !== 'undefined' && window.Snipcart) {
        const snipcart = window.Snipcart; // Type guard
        // Client-side validation for VAT (adds error if invalid; taxes handled server-side)
        // @ts-ignore - Snipcart event types infer no-params but docs show (ev); using unknown for params
        snipcart.events.on('page.validating', async (ev: any) => {
          // or unknown if you prefer strictness
          // Narrow the type safely
          if (ev && typeof ev === 'object' && 'type' in ev && ev.type === 'billing-address') {
            // Now TS knows ev has .type, so no error
            const vatNumber = snipcart.api.cart.getCustomFieldValue('vatNumber');
            // @ts-ignore - api.cart methods defined in d.ts but TS not recognizing on Snipcart type
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
          const vatInput = document.querySelector('[name="vatNumber"]') as HTMLInputElement;
          if (vatInput) {
            vatInput.addEventListener('blur', async () => {
              const vatNumber = vatInput.value;
              const countrySelect = document.querySelector('[name="country"]') as HTMLSelectElement;
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

              let messageEl = document.querySelector('#vat-message') as HTMLSpanElement;
              if (!messageEl) {
                messageEl = document.createElement('span');
                messageEl.id = 'vat-message';
                messageEl.style.color = 'green';
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
                      messageEl.textContent = ' Valid - IVA charged';
                      messageEl.style.color = 'green';
                    } else if (euCountries.includes(country)) {
                      messageEl.textContent = ' Valid - 0% VAT applied';
                      messageEl.style.color = 'green';
                    } else {
                      messageEl.textContent = '';
                    }
                  } else {
                    messageEl.textContent = ' Invalid';
                    messageEl.style.color = 'red';
                  }
                } catch {
                  messageEl.textContent = ' Validation failed';
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
