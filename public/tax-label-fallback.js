// public/tax-label-fallback.js
(function () {
  function safe(fn) {
    try {
      return fn();
    } catch (_) {}
  }

  const EU = new Set([
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
  ]);

  function computeLabel(cart) {
    try {
      // If webhook already provided a nice name, keep it.
      const taxes = cart?.taxes || [];
      const first = Array.isArray(taxes) ? taxes[0] : null;
      if (first && typeof first.name === 'string' && first.name.trim() && first.name !== 'Taxes') {
        return first.name.trim();
      }
      const ctry = String(
        cart?.shippingAddress?.country || cart?.billingAddress?.country || '',
      ).toUpperCase();
      if (!ctry) return 'Taxes';
      if (ctry === 'ES') return 'IVA';
      if (EU.has(ctry)) return 'VAT';
      return 'Taxes';
    } catch (_) {
      return 'Taxes';
    }
  }

  // Find *all* likely “Taxes” title nodes across Snipcart UIs
  function findTaxTitleNodes() {
    const out = new Set();

    // Primary fee rows (Order summary)
    document.querySelectorAll('.snipcart-cart-summary-fees__item').forEach((item) => {
      const title = item.querySelector('.snipcart-cart-summary-fees__title');
      const amount = item.querySelector('.snipcart-cart-summary-fees__amount');
      const t = (title?.textContent || '').trim();
      if (title && amount && (/^tax(es)?$/i.test(t) || /^taxes\s*\/\s*vat\s*\/\s*iva$/i.test(t))) {
        out.add(title);
      }
    });

    // Any other headings that render “Taxes” in different screens
    document
      .querySelectorAll(
        '.snipcart__font--slim, .snipcart__font--regular, .snipcart__font--secondary, .snipcart__font--bold',
      )
      .forEach((el) => {
        const t = (el.textContent || '').trim();
        if (/^tax(es)?$/i.test(t) || /^taxes\s*\/\s*vat\s*\/\s*iva$/i.test(t)) {
          // Only keep ones that sit in a summary/fee-ish context to avoid false positives
          if (
            el.closest(
              '.snipcart-cart-summary, .snipcart-cart__summary, .snipcart-cart-summary-fees, .snipcart-order__invoice, .snipcart-order__summary',
            )
          ) {
            out.add(el);
          }
        }
      });

    return Array.from(out);
  }

  function updateTaxRows() {
    safe(() => {
      const state = window.Snipcart?.store?.getState ? window.Snipcart.store.getState() : {};
      const cart = state?.cart || state;
      const label = computeLabel(cart);
      const nodes = findTaxTitleNodes();

      nodes.forEach((el) => {
        safe(() => {
          el.textContent = label;
        });
      });
    });
  }

  // Small poller when the cart opens / step changes (handles re-renders)
  function burstUpdate() {
    for (let i = 0; i < 20; i++) {
      setTimeout(updateTaxRows, 100 + i * 150); // ~3s of light retries
    }
  }

  // Expose for console debugging
  window.__frUpdateTaxRow = updateTaxRows;
  window.__frDebugTaxes = function () {
    const state = window.Snipcart?.store?.getState ? window.Snipcart.store.getState() : {};
    const cart = state?.cart || state;
    const nodes = findTaxTitleNodes();
    const label = computeLabel(cart);
    console.log({
      country: cart?.shippingAddress?.country || cart?.billingAddress?.country,
      taxes: cart?.taxes,
      computedLabel: label,
      nodes,
    });
  };

  function arm() {
    // Try now, then lightly whenever DOM changes
    updateTaxRows();
    const mo = new MutationObserver(() => updateTaxRows());
    mo.observe(document.body, { childList: true, subtree: true });

    // Hook Snipcart events if present
    const on = window.Snipcart?.events?.on;
    if (typeof on === 'function') {
      on('cart.opened', burstUpdate);
      on('cart.closed', updateTaxRows);
      on('cart.updated', burstUpdate);
      on('theme.routechanged', burstUpdate);
      on('shippingrate.selected', burstUpdate);
      on('item.added', burstUpdate);
      on('item.updated', burstUpdate);
      on('item.removed', burstUpdate);
    }
  }

  function init() {
    setTimeout(arm, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('snipcart.ready', () => safe(burstUpdate));
})();
