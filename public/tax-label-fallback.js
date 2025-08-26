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

  const N = (x) => Number(x || 0);

  function getCart() {
    try {
      return (window.Snipcart.store?.getState?.() || {}).cart || {};
    } catch {
      return {};
    }
  }

  function selectSummaryBox() {
    return (
      document.querySelector('.snipcart-cart-summary-fees') ||
      document.querySelector('[class*="cart-summary-fees"]')
    );
  }

  function baseLabel(country) {
    const c = String(country || '').toUpperCase();
    if (c === 'ES') return 'IVA';
    if (EU.has(c)) return 'VAT';
    return 'Taxes';
  }

  function computeRatePct(cart) {
    // 1) prefer cart.taxes[0].rate
    try {
      const arr = Array.isArray(cart.taxes) ? cart.taxes : [];
      if (arr.length && typeof arr[0].rate === 'number') return Math.round(arr[0].rate * 100);
    } catch {}
    // 2) fallback: derive from totals (items + shipping)
    const base = N(cart.itemsTotal) + N(cart.shippingInformation?.fees);
    const total = N(cart.taxesTotal);
    if (base > 0 && total > 0) {
      const pct = Math.round((total / base) * 100);
      if (pct > 0 && pct < 50) return pct; // sanity
    }
    return null;
  }

  function hideNativeTaxes(box) {
    if (!box) return;
    for (const it of box.querySelectorAll('.snipcart-cart-summary-fees__item')) {
      const t = it.querySelector('.snipcart-cart-summary-fees__title');
      const txt = (t?.textContent || '').trim();
      // Hide any built-in Taxes/VAT/IVA rows so we don’t double-render
      if (/^(Taxes|VAT|IVA)\b/i.test(txt)) it.style.display = 'none';
    }
  }

  function ensureRow() {
    const box = selectSummaryBox();
    if (!box) return null;

    hideNativeTaxes(box);

    let row = box.querySelector('#fr-tax-row');
    if (!row) {
      row = document.createElement('div');
      row.id = 'fr-tax-row';
      row.className = 'snipcart-cart-summary-fees__item snipcart__font--slim';
      row.innerHTML = `
        <span class="snipcart-cart-summary-fees__title"></span>
        <span class="snipcart-cart-summary-fees__amount"></span>
      `;
      const total = box.querySelector('.snipcart-cart-summary-fees__total');
      if (total) box.insertBefore(row, total);
      else box.appendChild(row);
    } else {
      row.style.display = '';
    }
    return row;
  }

  function update() {
    const cart = getCart();
    const country = cart.shippingAddress?.country || cart.billingAddress?.country || '';
    const labelBase = baseLabel(country);
    const ratePct = computeRatePct(cart);
    const label = ratePct ? `${labelBase} (${ratePct}%)` : labelBase;
    const amount = N(cart.taxesTotal);
    const currency = (cart.currency || 'EUR').toUpperCase();

    const row = ensureRow();
    if (!row) return;

    const t = row.querySelector('.snipcart-cart-summary-fees__title');
    const a = row.querySelector('.snipcart-cart-summary-fees__amount');
    if (t) t.textContent = label;
    if (a) {
      try {
        a.textContent = new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
          amount,
        );
      } catch {
        a.textContent = amount.toFixed(2);
      }
    }
  }

  // Expose manual trigger immediately so you can test in console
  window.__frUpdateTaxRow = function () {
    try {
      update();
    } catch (_) {}
  };

  function boot() {
    // Hook Snipcart events if present
    const ev = window.Snipcart?.events;
    if (ev && typeof ev.on === 'function') {
      [
        'theme.routechanged',
        'cart.ready',
        'cart.updated',
        'cart.closed',
        'cart.confirmed',
        'item.added',
        'item.removed',
        'shippingrates.changed',
        'cart.shippingaddress.changed',
        'cart.billingaddress.changed',
      ].forEach((e) => ev.on(e, () => setTimeout(update, 60)));
    }

    // Watch DOM rebuilds from Snipcart (Vue re-mounts)
    const mo = new MutationObserver(() => update());
    mo.observe(document.body, { subtree: true, childList: true });

    // Periodic nudge for stubborn cases (stops after 15s)
    const t0 = Date.now();
    const tick = setInterval(() => {
      update();
      if (Date.now() - t0 > 15000) clearInterval(tick);
    }, 250);

    // First paint
    update();
  }

  function waitAndBoot() {
    const ok = () => !!selectSummaryBox() || !!window.Snipcart?.events?.on;
    const id = setInterval(() => {
      if (ok()) {
        clearInterval(id);
        boot();
      }
    }, 120);
    setTimeout(() => clearInterval(id), 30000); // give up after 30s
  }

  if (document.readyState !== 'loading') waitAndBoot();
  else document.addEventListener('DOMContentLoaded', waitAndBoot);
})();
