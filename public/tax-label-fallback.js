// public/tax-label-fallback.js
(function () {
  var EU = [
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
  ];

  function computeLabel(cart) {
    var C =
      (cart && cart.shippingAddress && cart.shippingAddress.country) ||
      (cart && cart.billingAddress && cart.billingAddress.country) ||
      '';
    var base = 'Taxes';
    if (C === 'ES') base = 'IVA';
    else if (EU.indexOf(C) !== -1) base = 'VAT';

    var rate = 0;
    if (cart && cart.taxes && cart.taxes.length) rate = Math.round((cart.taxes[0].rate || 0) * 100);

    return rate > 0 ? base + ' (' + rate + '%)' : base;
  }

  function apply(cart) {
    try {
      var label = computeLabel(cart);
      var titles = document.querySelectorAll(
        '.snipcart-cart-summary-fees__item .snipcart-cart-summary-fees__title',
      );
      titles.forEach(function (el) {
        var t = (el.textContent || '').trim();
        if (/^(Taxes|VAT|IVA)(\s*\(\d+%?\))?$/.test(t)) {
          el.textContent = label;
        }
      });
    } catch (_) {}
  }

  function init() {
    if (!window.Snipcart || !window.Snipcart.api) return;
    // apply when cart is ready/updated
    window.Snipcart.api.on('cart.ready', apply);
    window.Snipcart.api.on('cart.updated', apply);

    // also observe DOM to catch first paint
    var tick = function () {
      try {
        var st =
          window.Snipcart.store &&
          window.Snipcart.store.getState &&
          window.Snipcart.store.getState();
        if (st && st.cart) apply(st.cart);
      } catch (_) {}
    };
    var mo = new MutationObserver(tick);
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
