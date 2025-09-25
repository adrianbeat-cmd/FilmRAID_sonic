'use client';

import Script from 'next/script';

import { getSnipcartPublicKey } from '@/components/getSnipcartKey';

export default function SnipcartLoader() {
  const key = getSnipcartPublicKey();

  return (
    <>
      <Script
        src="https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.js"
        async
        data-api-key={key}
      />
      <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.3/default/snipcart.css" />
      {/* Snipcart root container (required) */}
      <div
        hidden
        id="snipcart"
        data-config-modal-style="side"
        data-templates-url="/snipcart-templates.html"
      />
    </>
  );
}
