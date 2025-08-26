// public/tax-label-fallback.js
(function () {
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

  function getState() {
    try {
      return (window.Snipcart.store && window.Snipcart.store.getState()) || {};
    } catch {
      return {};
    }
  }

  function nf(amount, currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (currency || 'EUR').toUpperCase(),
      }).format(amount);
    } catch {
      return Number(amount || 0).toFixed(2);
    }
  }

  function labelAndAmount() {
    const s = getState();
    const cart = s.cart || {};
    const shipping = cart.shippingAddress || {};
    const billing = cart.billingAddress || {};
    const country = String(shipping.country || billing.country || '').toUpperCase();
    const isEU = EU.has(country);
    const currency = String(cart.currency || 'EUR').toUpperCase();

    // taxesTotal is reliable even if cart.taxes is a Vue observable
    const taxesTotal = Number(cart.taxesTotal || 0);

    // Try to read rate (%) from cart.taxes[0].rate when available
    let ratePct = null;
    try {
      const taxesArr = Array.isArray(cart.taxes) ? cart.taxes : [];
      if (taxesArr.length && typeof taxesArr[0].rate === 'number') {
        ratePct = Math.round(taxesArr[0].rate * 100);
      }
    } catch {}

    let base = 'Taxes';
    if (country === 'ES') base = 'IVA';
    else if (isEU) base = 'VAT';

    // If we know the rate and it's > 0, append it; otherwise keep bare label
    const label = ratePct && ratePct > 0 ? `${base} (${ratePct}%)` : base;

    return { label, amount: taxesTotal, currency };
  }

  function ensureRow() {
    const box = document.querySelector('.snipcart-cart-summary-fees');
    if (!box) return null;

    // Hide Snipcart's own taxes row so we don't show it twice
    for (const it of box.querySelectorAll('.snipcart-cart-summary-fees__item')) {
      const t = it.querySelector('.snipcart-cart-summary-fees__title');
      if (t && /^(Taxes|VAT|IVA)\b/i.test((t.textContent || '').trim())) {
        it.style.display = 'none';
      }
    }

    let row = box.querySelector('#fr-tax-row');
    if (row) return row;

    row = document.createElement('div');
    row.id = 'fr-tax-row';
    row.className = 'snipcart-cart-summary-fees__item snipcart__font--slim';
    row.innerHTML = `
      <span class="snipcart-cart-summary-fees__title"></span>
      <span class="snipcart-cart-summary-fees__amount"></span>
    `;

    const total = box.querySelector('.snipcart-cart-summary-fees__total');
    if (total && total.parentElement === box) box.insertBefore(row, total);
    else box.appendChild(row);

    return row;
  }

  function update() {
    const row = ensureRow();
    if (!row) return;

    const { label, amount, currency } = labelAndAmount();
    const titleEl = row.querySelector('.snipcart-cart-summary-fees__title');
    const amountEl = row.querySelector('.snipcart-cart-summary-fees__amount');

    if (titleEl) titleEl.textContent = label;
    if (amountEl) amountEl.textContent = nf(amount, currency);
  }

  function init() {
    if (
      !(
        window.Snipcart &&
        window.Snipcart.events &&
        typeof window.Snipcart.events.on === 'function'
      )
    )
      return;

    // Update now & on relevant events
    update();
    const ev = window.Snipcart.events;
    [
      'theme.routechanged',
      'cart.ready',
      'cart.updated',
      'cart.closed',
      'cart.shippingaddress.changed',
      'cart.billingaddress.changed',
      'cart.confirmed',
    ].forEach((e) => ev.on(e, () => setTimeout(update, 80)));

    // Also track DOM rebuilds
    const mo = new MutationObserver(() => update());
    mo.observe(document.body, { subtree: true, childList: true });

    // Expose manual trigger for debugging
    window.__frUpdateTaxRow = update;
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('snipcart.ready', init);
})();
