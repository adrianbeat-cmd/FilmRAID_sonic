'use client';
import { useEffect } from 'react';

export default function Snipcart() {
  useEffect(() => {
    let cancelled = false;

    async function injectTemplatesOnce() {
      try {
        if (document.getElementById('snipcart-templates')) return; // already present

        const res = await fetch('/snipcart-templates.html', { cache: 'no-cache' });
        if (!res.ok) return;

        const html = await res.text();
        if (cancelled || !html) return;

        // Create a container and insert into body BEFORE Snipcart initializes deeper screens.
        const container = document.createElement('div');
        container.innerHTML = html.trim();

        // Ensure we actually have a single-root element with the right id
        const root = container.firstElementChild;
        if (root && root.id === 'snipcart-templates') {
          document.body.appendChild(root);
        }
      } catch {
        // swallow – missing templates must not crash checkout
      }
    }

    injectTemplatesOnce();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Snipcart stylesheet */}
      <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.css" />
      {/* Snipcart script */}
      <script async src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js" />
      {/* Root: keep config minimal */}
      <div
        hidden
        id="snipcart"
        data-api-key={process.env.NEXT_PUBLIC_SNIPCART_API_KEY}
        data-config-modal-style="side"
      />
    </>
  );
}
