'use client';

import { useEffect } from 'react';

import { getSnipcartPublicKey } from '@/components/getSnipcartKey';

export default function SnipcartLoader() {
  const key = getSnipcartPublicKey();

  useEffect(() => {
    if (window.Snipcart || document.querySelector('script[src*="snipcart.js"]')) {
      return;
    }

    window.SnipcartSettings = {
      publicApiKey: key,
      loadStrategy: 'on-user-interaction',
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.js';
    script.async = true;
    document.body.appendChild(script);

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
      data-config-add-product-behavior="open"
    />
  );
}
