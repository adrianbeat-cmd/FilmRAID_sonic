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
      const taxes = cart?.taxes || [];
      const t0 = Array.isArray(taxes) ? taxes[0] : null;
      if (t0 && typeof t0.name === 'string') {
        const n = t0.name.trim();
        if (n && n.toLowerCase() !== 'taxes') return n; // respect webhook-provided custom names
      }
      const ctry = String(
        cart?.shippingAddress?.country || cart?.billingAddress?.country || '',
      ).toUpperCase();
      if (!ctry) return 'Taxes';
      if (ctry === 'ES') return 'IVA';
      if (EU.has(ctry)) return 'VAT';
      return 'Taxes';
    } catch {
      return 'Taxes';
    }
  }

  // Deep query across every nested shadow root
  function deepQueryAll(root, selector, acc) {
    acc = acc || [];
    if (!root) return acc;
    if (root.querySelectorAll) {
      root.querySelectorAll(selector).forEach((el) => acc.push(el));
    }
    const kids = root instanceof ShadowRoot ? root.children : root.children || [];
    for (const el of kids) {
      if (el.shadowRoot) deepQueryAll(el.shadowRoot, selector, acc);
      deepQueryAll(el, selector, acc);
    }
    return acc;
  }

  // Find all fee title nodes (covers both “summary-fees” & “cart-summary-fees” variants)
  function findAllFeeTitles() {
    const selectors = [
      'span[class*="summary-fees__title"]',
      'div[class*="summary-fees__title"]',
      'span[class*="cart-summary-fees__title"]',
      'div[class*="cart-summary-fees__title"]',
    ];
    const results = new Set();
    selectors.forEach((sel) => deepQueryAll(document, sel, []).forEach((n) => results.add(n)));
    return Array.from(results);
  }

  // Replace only the FIRST text node inside the title element if it starts with "Taxes"
  function replaceTitleNode(el, newLabel) {
    if (!el || !newLabel) return;
    // Skip if already has desired label at the start:
    const firstText = Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
    if (!firstText) return;

    const current = String(firstText.nodeValue || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!current) return;

    // If it's already IVA or VAT, stop.
    const lower = current.toLowerCase();
    if (lower.startsWith('iva') || lower.startsWith('vat')) return;

    // Only replace when it starts with "Taxes"
    if (/^taxes\b/i.test(current)) {
      // preserve any trailing text after "Taxes" (should be none, but just in case)
      const tail = current.replace(/^taxes\b/i, '').trim();
      firstText.nodeValue = newLabel + (tail ? ' ' + tail : '');
    }
  }

  function updateTaxLabelsDeep() {
    const state =
      safe(() => window.Snipcart?.store?.getState && window.Snipcart.store.getState()) || {};
    const cart = state?.cart || state;
    const label = computeLabel(cart);

    const titles = findAllFeeTitles();
    titles.forEach((el) => replaceTitleNode(el, label));
  }

  // Retry bursts after re-renders
  function burst() {
    for (let i = 0; i < 20; i++) setTimeout(updateTaxLabelsDeep, 100 + i * 150);
  }

  // Observe DOM & listen to Snipcart events
  function arm() {
    updateTaxLabelsDeep();

    const mo = new MutationObserver(() => updateTaxLabelsDeep());
    mo.observe(document.documentElement, { childList: true, subtree: true });

    const on = safe(() => window.Snipcart?.events?.on);
    if (typeof on === 'function') {
      on('cart.opened', burst);
      on('cart.updated', burst);
      on('theme.routechanged', burst);
      on('item.added', burst);
      on('item.updated', burst);
      on('item.removed', burst);
      on('shippingrate.selected', burst);
      on('cart.closed', updateTaxLabelsDeep);
    }
  }

  // Expose tiny debug helpers
  window.__frUpdateTaxRow = updateTaxLabelsDeep;
  window.__frDeepDebug = function () {
    const state =
      safe(() => window.Snipcart?.store?.getState && window.Snipcart.store.getState()) || {};
    const cart = state?.cart || state;
    const label = computeLabel(cart);
    const titles = findAllFeeTitles();
    console.log({
      country: cart?.shippingAddress?.country || cart?.billingAddress?.country,
      taxes: cart?.taxes,
      computedLabel: label,
      titlesFound: titles.length,
      titles,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
  document.addEventListener('snipcart.ready', arm);
})();
