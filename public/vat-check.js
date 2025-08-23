(function () {
  const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;

  function wireUp(input) {
    if (!input) return;
    const msg = document.querySelector('#vat-message');
    if (!msg) return;

    function update() {
      const v = (input.value || '').replace(/\s+/g, '');
      if (!v) {
        msg.textContent = '';
        msg.style.color = '';
        return;
      }
      if (EU_VAT_REGEX.test(v)) {
        msg.textContent = '✓ VAT format looks valid';
        msg.style.color = 'green';
      } else {
        msg.textContent = '✗ VAT format looks invalid';
        msg.style.color = 'crimson';
      }
    }
    input.addEventListener('input', update);
    update();
  }

  function tryAttach() {
    const input = document.querySelector('#vatNumber');
    if (input) {
      wireUp(input);
      return true;
    }
    return false;
  }

  document.addEventListener('snipcart.ready', function () {
    if (tryAttach()) return;
    const obs = new MutationObserver(() => {
      if (tryAttach()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
