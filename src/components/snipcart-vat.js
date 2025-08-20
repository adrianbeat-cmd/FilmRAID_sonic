'use client';

import { useEffect } from 'react';

interface SnipcartSettings {
  publicApiKey: string;
  templatesUrl?: string;
  version?: string;
}

declare global {
  interface Window {
    SnipcartSettings?: SnipcartSettings;
  }
}

const Snipcart = () => {
  useEffect(() => {
    // Initialize Snipcart settings
    if (typeof window !== 'undefined') {
      window.SnipcartSettings = {
        publicApiKey: 'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy',
        templatesUrl: '/snipcart-templates.html',
        version: '3.6.0', // Specify version to avoid auto-update warning
      };
    }

    // Load Snipcart script
    if (!document.getElementById('snipcart-script')) {
      const script = document.createElement('script');
      script.id = 'snipcart-script';
      script.src = 'https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div
      id="snipcart"
      hidden={true}
      data-api-key="NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy"
      data-config-modal-style="side"
      data-config-add-product-behavior="none" // Fixes history.replaceState error in Next.js
    />
  );
};

export default Snipcart;