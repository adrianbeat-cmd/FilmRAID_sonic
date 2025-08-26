// public/tax-label-fallback.js
(function () {
  // never throw
  function safe(fn) {
    try {
      fn();
    } catch (_) {}
  }

  // compute our label
  function computeLabel(cart) {
    try {
      const t = (cart && cart.taxes) || [];
      // If webhook already gives us a nice name (IVA / VAT / etc), keep it.
      if (
        Array.isArray(t) &&
        t.length &&
        t[0] &&
        typeof t[0].name === 'string' &&
        t[0].name.trim() &&
        t[0].name !== 'Taxes'
      ) {
        return t[0].name;
      }
      // fallback by country
      const ctry = String(
        cart?.shippingAddress?.country || cart?.billingAddress?.country || '',
      ).toUpperCase();
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
      if (!ctry) return 'Taxes';
      if (ctry === 'ES') return 'IVA';
      if (EU.has(ctry)) return 'VAT';
      return 'Taxes';
    } catch (_) {
      return 'Taxes';
    }
  }

  // update all visible “Taxes” rows we can see
  function updateTaxRows() {
    safe(() => {
      const state =
        window.Snipcart && window.Snipcart.store && window.Snipcart.store.getState
          ? window.Snipcart.store.getState()
          : {};
      const cart = state?.cart || state; // be flexible
      const label = computeLabel(cart);

      // Titles in summaries use this class
      const nodes = document.querySelectorAll('.snipcart-cart-summary-fees__title');
      nodes.forEach((el) => {
        const txt = (el.textContent || '').trim();
        if (txt === 'Taxes' || txt === 'Taxes / VAT / IVA') {
          el.textContent = label;
        }
      });
    });
  }

  // expose manual trigger for console testing
  window.__frUpdateTaxRow = updateTaxRows;

  // wire up as safely as possible
  function arm() {
    // try once now
    updateTaxRows();

    // If Snipcart events are available, hook them
    if (
      window.Snipcart &&
      window.Snipcart.events &&
      typeof window.Snipcart.events.on === 'function'
    ) {
      const on = window.Snipcart.events.on;
      on('cart.updated', updateTaxRows);
      on('theme.routechanged', () => setTimeout(updateTaxRows, 50));
      on('shippingrate.selected', updateTaxRows);
      on('item.added', updateTaxRows);
      on('item.updated', updateTaxRows);
      on('item.removed', updateTaxRows);
    }

    // MutationObserver as a last resort—very light
    const mo = new MutationObserver(() => updateTaxRows());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // Wait until Snipcart is likely present, but never block
  function init() {
    // run after a tiny delay so the modal can mount
    setTimeout(arm, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Also listen for Snipcart’s ready document event if fired
  document.addEventListener('snipcart.ready', () => safe(updateTaxRows));
})();
