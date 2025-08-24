// /public/vat-check.js
(function () {
  const log = (...a) => console.log('[FilmRAID VAT]', ...a);

  // Wait until Snipcart is ready and the Billing step is in DOM
  function onReady(cb) {
    if (document.querySelector('#snipcart')) return cb();
    const obs = new MutationObserver(() => {
      if (document.querySelector('#snipcart')) {
        obs.disconnect();
        cb();
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setMessage(el, type, text) {
    el.textContent = text;
    el.style.marginTop = '0.25rem';
    el.style.display = 'block';
    el.style.fontWeight = '600';
    el.style.color = type === 'ok' ? '#16a34a' : type === 'warn' ? '#f59e0b' : '#dc2626';
  }

  async function validateVat(raw) {
    const vat = String(raw || '')
      .toUpperCase()
      .trim();
    if (!vat) return { state: 'empty' };

    if (!/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(vat)) {
      return { state: 'bad-format' };
    }

    try {
      const r = await fetch('/.netlify/functions/vat-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vat }),
      });
      const j = await r.json();
      if (!j.ok) return { state: 'error' };
      return j.valid ? { state: 'valid', info: j } : { state: 'invalid', info: j };
    } catch {
      return { state: 'error' };
    }
  }

  function toggleContinue(disabled) {
    const btn = document.querySelector('#snipcart .snipcart-button-primary');
    if (btn) btn.disabled = !!disabled;
  }

  onReady(() => {
    // Rebind every time the modal changes pages
    const root = document.getElementById('snipcart');
    const obs = new MutationObserver(() => {
      const vatInput = $('#vatNumber', root);
      const msg = $('#vat-message', root);

      if (!vatInput || !msg) return;

      // Debounced validation on input
      let t;
      const run = async () => {
        const { state, info } = await validateVat(vatInput.value);
        if (state === 'empty') {
          setMessage(msg, 'warn', 'Optional. Add your EU VAT to remove VAT in intra‑EU B2B.');
          toggleContinue(false);
          return;
        }
        if (state === 'bad-format') {
          setMessage(msg, 'bad', 'Invalid format. Use country code + number (e.g. ESB10680478).');
          toggleContinue(true);
          return;
        }
        if (state === 'error') {
          setMessage(msg, 'warn', 'Validation service unavailable. You can proceed or try again.');
          toggleContinue(false);
          return;
        }
        if (state === 'invalid') {
          setMessage(msg, 'bad', '✕ VAT number not valid in VIES.');
          toggleContinue(true);
          return;
        }
        // valid
        const name = info && info.name ? ` — ${info.name}` : '';
        setMessage(msg, 'ok', `✓ VAT validated${name}`);
        toggleContinue(false);
      };

      vatInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(run, 400);
      });
      vatInput.addEventListener('blur', run);

      // Initialize message once
      setMessage(msg, 'warn', 'Optional. Add your EU VAT to remove VAT in intra‑EU B2B.');
    });

    obs.observe(root, { childList: true, subtree: true });
  });
})();
