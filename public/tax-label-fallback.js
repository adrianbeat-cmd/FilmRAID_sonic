// public/tax-label-fallback.js
(function () {
  // EU countries
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

  function getCountry() {
    // 1) Ask Snipcart store if available
    try {
      const st = window.Snipcart?.store?.getState?.();
      const c = st?.cart?.shippingAddress?.country || st?.cart?.billingAddress?.country || '';
      if (c) return String(c).toUpperCase();
    } catch (_) {}

    // 2) Fallback: read the currently visible country field (input or select)
    const el =
      document.querySelector('[name="country"]') ||
      document.querySelector('select[name="country"]');
    if (!el) return '';
    let v = (el.value || '').toString().trim().toUpperCase();
    if (!v && el.tagName === 'SELECT') {
      v = el.options[el.selectedIndex]?.value?.toString().trim().toUpperCase() || '';
    }
    return v;
  }

  function labelFor(country) {
    if (!country) return 'Taxes';
    if (country === 'ES') return 'IVA';
    if (EU.has(country)) return 'VAT';
    return 'Taxes';
  }

  function applyLabel() {
    const want = labelFor(getCountry());

    // Find all “fee” title spans and rewrite ones that look like taxes
    const titles = document.querySelectorAll(
      '.snipcart-cart-summary-fees__item .snipcart-cart-summary-fees__title',
    );

    let touched = false;
    titles.forEach((span) => {
      const txt = (span.textContent || '').trim();
      // Only touch rows that are clearly tax-related
      if (/^(Taxes|Tax|VAT|IVA)(\s|\(|$)/i.test(txt)) {
        if (txt !== want && !new RegExp(`^${want}(\\s|\\(|$)`).test(txt)) {
          span.textContent = want;
        }
        touched = true;
      }
    });

    // If no tax row is rendered yet, do nothing — Snipcart adds it
    // after address/shipping selection or when a webhook returns taxes.
    return touched;
  }

  function arm() {
    // Run now
    applyLabel();

    // Update on any DOM change inside Snipcart modal
    const mo = new MutationObserver(() => applyLabel());
    mo.observe(document.body, { subtree: true, childList: true });

    // Update on Snipcart route/cart changes
    if (window.Snipcart?.events?.on) {
      window.Snipcart.events.on('theme.routechanged', () => setTimeout(applyLabel, 50));
      window.Snipcart.events.on('cart.updated', () => setTimeout(applyLabel, 0));
      window.Snipcart.events.on('item.added', () => setTimeout(applyLabel, 0));
      window.Snipcart.events.on('shipping.selected', () => setTimeout(applyLabel, 0));
    }
  }

  // Start when Snipcart is ready, or as soon as DOM is ready
  if (document.readyState !== 'loading') {
    document.addEventListener('snipcart.ready', arm, { once: true });
    // Also try immediately in case Snipcart was already ready
    setTimeout(arm, 0);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('snipcart.ready', arm, { once: true });
      setTimeout(arm, 0);
    });
  }
})();
