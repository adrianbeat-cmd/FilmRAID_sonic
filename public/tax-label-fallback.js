// public/tax-label-fallback.js
(function () {
  // EU list for label logic
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

  function computeRegionLabel(country) {
    country = (country || '').toUpperCase();
    if (!country) return 'Taxes';
    if (country === 'ES') return 'IVA';
    if (EU.has(country)) return 'VAT';
    return 'Taxes';
  }

  function getState() {
    try {
      return window.Snipcart && window.Snipcart.store && window.Snipcart.store.getState
        ? window.Snipcart.store.getState()
        : null;
    } catch (_) {
      return null;
    }
  }

  function getCountry() {
    var s = getState();
    if (!s) return '';
    var c = s.cart || {};
    return (
      (c.shippingAddress && c.shippingAddress.country) ||
      (c.billingAddress && c.billingAddress.country) ||
      ''
    );
  }

  function relabel() {
    try {
      var s = getState();
      var cart = (s && s.cart) || {};
      var taxes = cart.taxes || [];
      var country = getCountry();
      var regionLabel = computeRegionLabel(country);

      // If webhook gave us a name (e.g., "IVA (21%)"), prefer that when we see a generic "Taxes"
      var desiredText = taxes.length === 1 && taxes[0].name ? taxes[0].name : regionLabel;

      // Find “Taxes” titles in the summary and swap them
      var nodes = document.querySelectorAll(
        '.snipcart-cart-summary-fees__item .snipcart-cart-summary-fees__title,' +
          '.snipcart-summary-fees__item .snipcart-summary-fees__title',
      );

      nodes.forEach(function (n) {
        // Only touch the generic label (avoid Subtotal/Shipping/etc.)
        if (/^\s*Taxes\s*$/i.test(n.textContent)) {
          n.textContent = desiredText;
        }
      });
    } catch (_) {}
  }

  function arm() {
    // Initial
    relabel();

    // React to common Snipcart events
    if (
      window.Snipcart &&
      window.Snipcart.events &&
      typeof window.Snipcart.events.on === 'function'
    ) {
      var ev = window.Snipcart.events;
      [
        'theme.routechanged',
        'item.added',
        'item.removed',
        'cart.confirmed',
        'customer.updated',
        'customer.information_submitted',
        'shippingrates.changed',
        'cart.closed',
        'cart.opened',
      ].forEach(function (e) {
        ev.on(e, function () {
          setTimeout(relabel, 80);
        });
      });
    }

    // Observe DOM changes (Vue rerenders)
    var mo = new MutationObserver(function () {
      relabel();
    });
    mo.observe(document.body, { subtree: true, childList: true });
  }

  function init() {
    // If Snipcart is ready, arm immediately; otherwise retry briefly
    if (
      window.Snipcart &&
      window.Snipcart.events &&
      typeof window.Snipcart.events.on === 'function'
    ) {
      arm();
      return;
    }
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
      } else if (tries > 80) {
        clearInterval(id); // give up quietly after ~8s
      }
    }, 100);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('snipcart.ready', init);
})();
