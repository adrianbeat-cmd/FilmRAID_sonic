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
      // If webhook already set a nice label (not just "Taxes"), keep it.
      const taxes = cart?.taxes || [];
      const t0 = Array.isArray(taxes) ? taxes[0] : null;
      if (t0 && typeof t0.name === 'string') {
        const n = t0.name.trim();
        if (n && n.toLowerCase() !== 'taxes') return n;
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

  // Deep query across *all* nested shadow roots
  function deepQueryAll(root, selector, acc) {
    acc = acc || [];
    if (!root) return acc;
    if (root.querySelectorAll) {
      root.querySelectorAll(selector).forEach((el) => acc.push(el));
    }
    // Walk children and pierce their shadowRoots too
    const kids = root instanceof ShadowRoot ? root.children : root.children || [];
    for (const el of kids) {
      if (el.shadowRoot) deepQueryAll(el.shadowRoot, selector, acc);
      // Also descend into regular subtree
      deepQueryAll(el, selector, acc);
    }
    return acc;
  }

  // Replace text nodes that are exactly "Taxes" (or our previous fallbacks) inside summary-ish containers
  function replaceInContainer(container, newLabel) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
          const s = node.nodeValue.trim();
          // Only exact matches to avoid false positives:
          if (/^tax(es)?$/i.test(s)) return NodeFilter.FILTER_ACCEPT;
          if (/^vat$/i.test(s)) return NodeFilter.FILTER_ACCEPT;
          if (/^iva$/i.test(s)) return NodeFilter.FILTER_ACCEPT;
          if (/^taxes\s*\/\s*vat\s*\/\s*iva$/i.test(s)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_REJECT;
        },
      },
      false,
    );
    const targets = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) targets.push(n);
    targets.forEach((n) =>
      safe(() => {
        n.nodeValue = newLabel;
      }),
    );
  }

  function updateTaxLabelsDeep() {
    const state =
      safe(() => window.Snipcart?.store?.getState && window.Snipcart.store.getState()) || {};
    const cart = state?.cart || state;
    const label = computeLabel(cart);

    // Likely containers where fee lines / order summary render:
    const selectors = [
      '.snipcart-cart-summary-fees',
      '.snipcart-order__summary',
      '.snipcart-cart__summary',
      '.snipcart-summary',
      '.snipcart-order__invoice',
    ];

    // Search both light DOM and every Snipcart shadow root
    const containers = new Set();
    selectors.forEach((sel) => deepQueryAll(document, sel, []).forEach((el) => containers.add(el)));

    containers.forEach((c) => replaceInContainer(c, label));
  }

  // Light retries right after cart opens / route changes
  function burst() {
    for (let i = 0; i < 20; i++) setTimeout(updateTaxLabelsDeep, 100 + i * 150);
  }

  // Observe DOM to catch re-renders
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

  // Expose helpers for console
  window.__frUpdateTaxRow = updateTaxLabelsDeep;
  window.__frDeepDebug = function () {
    const state =
      safe(() => window.Snipcart?.store?.getState && window.Snipcart.store.getState()) || {};
    const cart = state?.cart || state;
    console.log({
      country: cart?.shippingAddress?.country || cart?.billingAddress?.country,
      taxes: cart?.taxes,
      computedLabel: computeLabel(cart),
    });
    // Count exact “Taxes/VAT/IVA” text nodes inside likely containers:
    const selectors = [
      '.snipcart-cart-summary-fees',
      '.snipcart-order__summary',
      '.snipcart-cart__summary',
      '.snipcart-summary',
      '.snipcart-order__invoice',
    ];
    let count = 0;
    const matches = [];
    selectors.forEach((sel) => {
      deepQueryAll(document, sel, []).forEach((c) => {
        const tw = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          const s = (n.nodeValue || '').trim();
          if (/^(tax(es)?)$|^(vat)$|^(iva)$|^taxes\s*\/\s*vat\s*\/\s*iva$/i.test(s)) {
            count++;
            matches.push({ text: s, node: n, container: c });
          }
        }
      });
    });
    console.log({ matchedTextNodes: count, sample: matches.slice(0, 5) });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
  document.addEventListener('snipcart.ready', arm);
})();
