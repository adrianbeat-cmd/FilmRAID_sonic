// public/tax-label-fallback.js
(function () {
  // Quick EU set for label logic
  var EU = new Set([
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

  function computeLabel(country) {
    country = (country || '').toUpperCase();
    if (!country) return 'Taxes';
    if (country === 'ES') return 'IVA';
    if (EU.has(country)) return 'VAT';
    return 'Taxes';
  }

  function getCountryFromState() {
    try {
      var state =
        window.Snipcart && window.Snipcart.store && window.Snipcart.store.getState
          ? window.Snipcart.store.getState()
          : null;
      if (!state) return '';
      var cart = state.cart || {};
      return (
        (cart.shippingAddress && cart.shippingAddress.country) ||
        (cart.billingAddress && cart.billingAddress.country) ||
        ''
      );
    } catch (_) {
      return '';
    }
  }

  function relabel() {
    try {
      var label = computeLabel(getCountryFromState());

      // 1) If our webhook provided a proper name (e.g., "IVA (21%)"), prefer that.
      //    If present, do nothing—Snipcart will already show it.
      var state =
        window.Snipcart && window.Snipcart.store && window.Snipcart.store.getState
          ? window.Snipcart.store.getState()
          : null;
      var taxes = (state && state.cart && state.cart.taxes) || [];

      if (taxes && taxes.length) {
        // If taxes exist and have custom names, let them show as-is.
        // Fallback: if Snipcart still rendered a generic "Taxes", replace that text.
        var nodes = document.querySelectorAll(
          '.snipcart-cart-summary-fees__item .snipcart-cart-summary-fees__title',
        );
        nodes.forEach(function (n) {
          if (/^\s*Taxes\s*$/i.test(n.textContent)) {
            n.textContent = taxes.length === 1 ? taxes[0].name || label : label;
          }
        });
        return;
      }

      // 2) No taxes yet → show a friendly 0 row label (Taxes/VAT/IVA)
      var zeroRows = document.querySelectorAll(
        '.snipcart-cart-summary-fees__item .snipcart-cart-summary-fees__title',
      );
      zeroRows.forEach(function (n) {
        // Only touch neutral “Taxes” rows (avoid “Subtotal”, “Shipping”, etc.)
        if (/^\s*Taxes\s*$/i.test(n.textContent)) {
          n.textContent = label;
        }
      });
    } catch (_) {}
  }

  function arm() {
    relabel();

    // Re-run on Snipcart route changes
    if (
      window.Snipcart &&
      window.Snipcart.events &&
      typeof window.Snipcart.events.on === 'function'
    ) {
      window.Snipcart.events.on('theme.routechanged', function () {
        setTimeout(relabel, 80);
      });
      window.Snipcart.events.on('cart.confirmed', function () {
        setTimeout(relabel, 80);
      });
      window.Snipcart.events.on('item.added', function () {
        setTimeout(relabel, 80);
      });
      window.Snipcart.events.on('customer.information_submitted', function () {
        setTimeout(relabel, 80);
      });
    }

    // Also observe DOM changes just in case
    var mo = new MutationObserver(function () {
      relabel();
    });
    mo.observe(document.body, { subtree: true, childList: true });
  }

  // Wait for Snipcart to boot, then arm
  function init() {
    if (
      window.Snipcart &&
      window.Snipcart.events &&
      typeof window.Snipcart.events.on === 'function'
    ) {
      arm();
    } else {
      // Retry a few times while Snipcart initializes
      var tries = 0;
      var id = setInterval(function () {
        tries++;
        if (
          window.Snipcart &&
          window.Snipcart.events &&
          typeof window.Snipcart.events.on === 'function'
        ) {
          clearInterval(id);
          arm();
        } else if (tries > 60) {
          clearInterval(id); // give up silently after ~6s
        }
      }, 100);
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('snipcart.ready', init);
})();
