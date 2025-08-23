// /public/vat-check.js
(() => {
  const FN_URL = '/.netlify/functions/vat-verify';

  // Run only after Snipcart is ready
  document.addEventListener('snipcart.ready', () => {
    const host = document.querySelector('snipcart-root');
    const root = host && host.shadowRoot;
    if (!root) return;

    // When Snipcart view changes (cart/checkout), wire the VAT input
    host.addEventListener('snipcart.routechanged', () => {
      // 1) Find an existing VAT input inside Snipcart
      let vatInput =
        root.querySelector('input[name="vat-number"]') ||
        root.querySelector('#vat-number') ||
        // Some Snipcart themes name fields with full paths — try a couple common ones:
        root.querySelector('input[name="billingAddress.vatNumber"]') ||
        root.querySelector('input[id="billingAddress.vatNumber"]');

      // 2) If none exists, insert our own below the Company field
      if (!vatInput) {
        const companyInput =
          root.querySelector('input[name="billingAddress.companyName"]') ||
          root.querySelector('#billingAddress\\.companyName') ||
          root.querySelector('input[name="company"]') ||
          root.querySelector('#company');

        if (companyInput) {
          // Look for the container element (Snipcart usually wraps inputs)
          const container = companyInput.closest('div') || companyInput.parentElement;

          // Create label
          const label = document.createElement('label');
          label.setAttribute('for', 'vat-number');
          label.textContent = 'EU VAT number';

          // Create hint
          const hint = document.createElement('small');
          hint.className = 'vat-hint';
          hint.style.marginLeft = '0.5rem';
          hint.textContent = 'e.g. DE123456789';

          label.appendChild(hint);

          // Create input
          vatInput = document.createElement('input');
          vatInput.type = 'text';
          vatInput.id = 'vat-number';
          vatInput.name = 'vat-number';
          vatInput.autocomplete = 'off';
          vatInput.inputMode = 'text';
          vatInput.placeholder = 'Country code + digits';

          // Create a tidy wrapper (keeps styling similar to Snipcart fields)
          const wrap = document.createElement('div');
          wrap.style.display = 'flex';
          wrap.style.flexDirection = 'column';
          wrap.style.gap = '0.25rem';
          wrap.appendChild(label);
          wrap.appendChild(vatInput);

          // Insert right after Company field block
          if (container && container.parentElement) {
            container.parentElement.insertBefore(wrap, container.nextSibling);
          } else if (companyInput.parentElement) {
            companyInput.parentElement.insertBefore(wrap, companyInput.nextSibling);
          } else {
            // As a fallback, add somewhere visible
            root.appendChild(wrap);
          }
        }
      }

      if (!vatInput) return;

      // 3) Create / reuse a status line under the VAT input
      let status = root.querySelector('#vat-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'vat-status';
        status.style.fontSize = '0.875rem';
        status.style.marginTop = '0.25rem';
        vatInput.insertAdjacentElement('afterend', status);
      }

      const setStatus = (msg, color) => {
        status.textContent = msg || '';
        status.style.color = color || 'inherit';
      };

      // 4) Verify on input (debounced)
      let t;
      vatInput.addEventListener('input', () => {
        clearTimeout(t);
        const raw = vatInput.value.trim();
        if (!raw) {
          setStatus('', '');
          return;
        }
        setStatus('Checking VAT…');
        t = setTimeout(async () => {
          try {
            const res = await fetch(FN_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vat: raw }),
            });
            const json = await res.json();

            if (json && json.ok && json.valid) {
              const who = json.name ? ` (${json.name})` : '';
              setStatus(`Valid EU VAT${who}`, '#0a7f2e');
            } else if (json && json.ok === false && json.error === 'VIES unavailable') {
              setStatus('Could not reach VIES right now. Try again or continue.', '#b45309');
            } else {
              setStatus('Invalid VAT number', '#b91c1c');
            }
          } catch (_e) {
            setStatus('Could not verify VAT right now.', '#b45309');
          }
        }, 450);
      });
    });
  });
})();
