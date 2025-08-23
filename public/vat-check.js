// /public/vat-check.js
(function () {
  var FN_URL = '/.netlify/functions/vat-verify';
  var debounceTimer = null;

  function wireUp() {
    var host = document.querySelector('snipcart-root');
    if (!host || !host.shadowRoot) return;
    var root = host.shadowRoot;

    // Find an existing VAT input (common Snipcart names/ids)
    var vatInput =
      root.querySelector('input[id*="vat" i]') || root.querySelector('input[name*="vat" i]');

    if (!vatInput) return;

    // A small status element right after the input
    var status = root.querySelector('#vat-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'vat-status';
      status.style.fontSize = '0.875rem';
      status.style.marginTop = '0.25rem';
      vatInput.insertAdjacentElement('afterend', status);
    }

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'inherit';
    }

    // Remove previous listener (in case Snipcart re-renders)
    vatInput.oninput = null;

    vatInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);

      var raw = (vatInput.value || '').trim();
      if (!raw) {
        setStatus('', '');
        return;
      }

      setStatus('Checking VAT…');

      debounceTimer = setTimeout(function () {
        fetch(FN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vat: raw }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (json) {
            if (json && json.ok && json.valid) {
              var who = json.name ? ' (' + json.name + ')' : '';
              setStatus('Valid EU VAT' + who, '#0a7f2e');
            } else if (json && json.ok === false && json.error === 'VIES unavailable') {
              setStatus(
                'Could not reach VIES right now. You can try again or continue.',
                '#b45309',
              );
            } else {
              setStatus('Invalid VAT number', '#b91c1c');
            }
          })
          .catch(function () {
            setStatus('Could not verify VAT right now.', '#b45309');
          });
      }, 450);
    });
  }

  // Snipcart fires when its UI is ready
  document.addEventListener('snipcart.ready', function () {
    wireUp();
    // Re-wire on route/view changes (cart -> checkout, etc.)
    var host = document.querySelector('snipcart-root');
    if (host) host.addEventListener('snipcart.routechanged', wireUp);
  });
})();
