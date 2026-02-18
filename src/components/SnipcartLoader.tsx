'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { getSnipcartPublicKey } from '@/components/getSnipcartKey';

export default function SnipcartLoader() {
  const key = getSnipcartPublicKey();

  // This prevents the component from rendering anything during SSR/hydration
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Script
        src="https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.js"
        async
        strategy="afterInteractive" // Loads safely after the page is interactive
        data-api-key={key}
      />

      <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.css" />

      {/* Snipcart root container – comment out templates-url to stop the warning */}
      <div
        hidden
        id="snipcart"
        data-config-modal-style="side"
        // data-templates-url="/snipcart-templates.html"   ← COMMENT THIS LINE (or delete it)
      />
    </>
  );
}
