'use client';

import { useEffect } from 'react';

import { getSnipcartPublicKey } from '@/components/getSnipcartKey';

export default function SnipcartLoader() {
  const key = getSnipcartPublicKey();

  useEffect(() => {
    // Skip if already loaded
    if (window.Snipcart || document.querySelector('script[src*="snipcart.js"]')) {
      return;
    }

    // Set config early
    window.SnipcartSettings = {
      publicApiKey: key,
      ...(window.SnipcartSettings || {}), // preserve other settings if already present
    };
    window.SnipcartSettings!.publicApiKey = key; // ← add !
    // Optional: window.SnipcartSettings.loadStrategy = 'on-user-interaction';

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.js';
    script.async = true;
    document.body.appendChild(script);

    // Load CSS if missing
    if (!document.querySelector('link[href*="snipcart.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.css';
      document.head.appendChild(link);
    }

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div
      hidden
      id="snipcart"
      data-config-modal-style="side"
      // Do NOT add data-templates-url here unless you create/fix the file
    />
  );
}
