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
    </>
  );
}
