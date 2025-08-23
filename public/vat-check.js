// public/vat-check.js
(function () {
  const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;

  function paint(el, msg, color) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = color || '';
  }

  async function verify(vat) {
    try {
      const res = await fetch('/.netlify/functions/vat-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat }),
      });
      return await res.json();
    } catch {
      return { ok: false, error: 'network' };
    }
  }

  document.addEventListener('snipcart.ready', () => {
    const vatInput =
      document.querySelector('#snipcart #vatNumber') ||
      document.querySelector('#snipcart [name="vatNumber"]');

    // Create/locate message element
    let msg = document.querySelector('#snipcart #vat-message');
    if (!msg && vatInput && vatInput.parentElement) {
      msg = document.createElement('span');
      msg.id = 'vat-message';
      msg.style.display = 'block';
      msg.style.marginTop = '0.25rem';
      vatInput.parentElement.appendChild(msg);
    }

    if (!vatInput || !msg) return;

    // Live format hint
    vatInput.addEventListener('input', () => {
      const v = (vatInput.value || '').replace(/\s+/g, '').toUpperCase();
      if (!v) return paint(msg, '', '');
      if (EU_VAT_REGEX.test(v)) {
        paint(msg, '✓ VAT format looks valid', 'green');
      } else {
        paint(msg, '✗ VAT format looks invalid', 'crimson');
      }
    });

    // Real verification on blur (or when user stops typing for a moment)
    let t = null;
    const trigger = async () => {
      const raw = (vatInput.value || '').trim();
      if (!raw) return paint(msg, '', '');
      const v = raw.replace(/\s+/g, '').toUpperCase();

      if (!EU_VAT_REGEX.test(v)) {
        paint(msg, '✗ VAT format looks invalid', 'crimson');
        return;
      }

      paint(msg, 'Checking VAT with VIES…', '#444');
      const out = await verify(v);

      if (out.ok && out.valid) {
        const extra = [out.name, out.address].filter(Boolean).join(' — ');
        paint(msg, `✓ Valid EU VAT${extra ? ` (${extra})` : ''}`, 'green');
      } else if (out.ok && out.valid === false) {
        paint(msg, '✗ VAT not found / invalid', 'crimson');
      } else {
        paint(
          msg,
          'VIES unavailable right now — try again or continue (we’ll recheck during invoicing).',
          '#b45309',
        );
      }
    };

    vatInput.addEventListener('blur', trigger);
    vatInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(trigger, 900);
    });
  });
})();
