// public/snipcart-reorder.js
(function () {
  function movePhoneAfterEmail() {
    try {
      // Find the <snipcart-field> hosts
      const email = document.querySelector('snipcart-field[name="email"]');
      const phone = document.querySelector('snipcart-field[name="phone"]');

      if (!email || !phone) return;

      // If it's already in the right place, do nothing
      if (email.nextElementSibling === phone) return;

      // Move phone directly after email
      const parent = email.parentNode;
      if (parent) parent.insertBefore(phone, email.nextElementSibling);
    } catch (_) {}
  }

  function arm() {
    movePhoneAfterEmail();

    // Re-run on route changes inside Snipcart
    if (window.Snipcart?.events?.on) {
      window.Snipcart.events.on('theme.routechanged', () => setTimeout(movePhoneAfterEmail, 120));
    }

    // Also re-run on DOM mutations (Snipcart updates chunks as you type)
    const mo = new MutationObserver(() => movePhoneAfterEmail());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') arm();
  else document.addEventListener('DOMContentLoaded', arm);
  document.addEventListener('snipcart.ready', arm);
})();
