// src/app/layout.tsx
import { ReactNode } from 'react';

import localFont from 'next/font/local';
import Script from 'next/script';

import type { Metadata } from 'next';

import './globals.css';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { NavigationProvider } from '@/components/navigation-provider';
import CTA from '@/components/sections/cta';
import SnipcartConfig from '@/components/SnipcartConfig';
import { ThemeProvider } from '@/components/theme-provider';

// SF Pro
const sfProDisplay = localFont({
  src: [
    { path: './fonts/SF-Pro-Display-Light.otf', weight: '300', style: 'normal' },
    { path: './fonts/SF-Pro-Display-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/SF-Pro-Display-Medium.otf', weight: '500', style: 'normal' },
    { path: './fonts/SF-Pro-Display-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sf-pro-display',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.filmraid.pro'),
  title: {
    default: 'FilmRAID - Fast & Reliable Storage for Filmmakers',
    template: '%s | FilmRAID',
  },
  description:
    'Custom RAID storage solutions for film productions. Secure, fast transfers with 2-day EU delivery, tailored for digital cinema workflows.',
  keywords: [
    'RAID storage',
    'film production',
    'digital cinema',
    'data storage',
    'fast transfers',
    'EU delivery',
    'post-production',
    'DIT World',
    'custom RAID',
  ],
  authors: [{ name: 'FilmRAID' }],
  creator: 'FilmRAID',
  publisher: 'FilmRAID',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'FilmRAID - Fast & Reliable Storage for Filmmakers',
    description:
      'Custom RAID storage solutions for film productions. Secure, fast transfers with 2-day EU delivery, tailored for digital cinema workflows.',
    siteName: 'FilmRAID',
    type: 'website',
    url: 'https://www.filmraid.pro',
    images: [
      {
        url: 'https://www.filmraid.pro/images/preview.jpg',
        width: 300,
        height: 200,
        alt: 'FilmRAID - Fast & Reliable Storage for Filmmakers',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmRAID - Fast & Reliable Storage for Filmmakers',
    description:
      'Custom RAID storage solutions for film productions. Secure, fast transfers with 2-day EU delivery, tailored for digital cinema workflows.',
    images: ['https://www.filmraid.pro/images/preview.jpg'],
    creator: '@filmraid',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const publicKey =
    process.env.NEXT_PUBLIC_SNIPCART_PUBLIC_API_KEY ??
    'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Snipcart v3 CSS */}
        <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.css" />

        {/* Snipcart settings: full-page modal + open on add + templates file + version */}
        <Script
          id="snipcart-settings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      window.SnipcartSettings = {
        publicApiKey: "${process.env.NEXT_PUBLIC_SNIPCART_PUBLIC_API_KEY ?? 'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy'}",
        loadStrategy: "always",
        modalStyle: "full",
        addProductBehavior: "open",
        timeoutDuration: 2000,
        templatesUrl: "/snipcart-templates.html",
        version: "3.6.0"
      };
    `,
          }}
        />

        {/* Snipcart script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js"
          strategy="afterInteractive"
        />
        {/* VAT checker (UI + VIES call) */}
        <Script src="/vat-check.js" strategy="afterInteractive" />

        {/* EU VAT format hint that can see inside shadow DOM */}
        <Script id="eu-vat-format-check" strategy="afterInteractive">
          {`
            // Find elements even when Snipcart renders them inside shadow DOM
            function queryDeepAll(selector, root = document) {
              const results = [];
              const walker = (node) => {
                if (!node) return;
                if (node.querySelectorAll) node.querySelectorAll(selector).forEach(el => results.push(el));
                const descend = node.querySelectorAll ? node.querySelectorAll('*') : [];
                descend.forEach(el => { if (el.shadowRoot) walker(el.shadowRoot); });
                if (node instanceof ShadowRoot) node.childNodes.forEach(ch => { if (ch.shadowRoot) walker(ch.shadowRoot); });
              };
              walker(root);
              return results;
            }

            function bindVatHint() {
              const input = queryDeepAll('input#vatNumber, input[name="vatNumber"]')[0];
              const msg   = queryDeepAll('#vat-message')[0];
              if (!input || !msg) return false;

              const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;
              const update = () => {
                const v = (input.value || '').replace(/\\s+/g, '');
                if (!v) { msg.textContent = ''; msg.style.color = ''; return; }
                if (EU_VAT_REGEX.test(v)) {
                  msg.textContent = '✓ VAT format looks valid';
                  msg.style.color = 'green';
                } else {
                  msg.textContent = '✗ VAT format looks invalid';
                  msg.style.color = 'crimson';
                }
              };

              input.addEventListener('input', update, true);
              update();
              return true;
            }

            document.addEventListener('snipcart.ready', () => {
              // try now + a few retries as Snipcart swaps steps
              const delays = [80, 250, 600, 1200, 2000];
              let ok = bindVatHint();
              delays.forEach(ms => setTimeout(() => { if (!ok) ok = bindVatHint(); }, ms));

              // rebind on route changes inside the cart/checkout
              if (window.Snipcart?.events?.on) {
                Snipcart.events.on('route.changed', () => setTimeout(bindVatHint, 200));
              }
            });
          `}
        </Script>
        {/* EU VAT real check (uses our /api/vat-verify) */}
        <Script id="eu-vat-real-check" strategy="afterInteractive">
          {`
document.addEventListener("snipcart.ready", () => {
  const vatInput = document.querySelector('#vatNumber');
  const vatMsg = document.querySelector('#vat-message');
  if (!vatInput || !vatMsg) return;

  let lastValue = '';
  let lastResult = null;
  let inFlight = false;

  const setMsg = (text, color) => {
    vatMsg.textContent = text;
    vatMsg.style.color = color || '';
  };

  const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;

  async function verifyReal(v) {
    try {
      inFlight = true;
      setMsg('Checking VAT…', '#555');
      const res = await fetch('/api/vat-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat: v })
      });
      const json = await res.json();
      inFlight = false;

      if (!json.ok) {
        lastResult = null;
        setMsg('Couldn\\'t verify VAT right now (service busy). You can still continue.', 'orange');
        return;
      }

      if (json.valid) {
        lastResult = { valid: true, name: json.name || '', address: json.address || '' };
        setMsg('✓ Valid VAT (VIES)', 'green');
      } else {
        lastResult = { valid: false };
        setMsg('✗ VAT not found in VIES', 'crimson');
      }
    } catch {
      inFlight = false;
      lastResult = null;
      setMsg('Couldn\\'t verify VAT right now (network). You can still continue.', 'orange');
    }
  }

  async function onChange() {
    const raw = (vatInput.value || '').replace(/\\s+/g, '').toUpperCase();
    if (!raw) { setMsg('', ''); lastResult = null; return; }

    if (!EU_VAT_REGEX.test(raw)) {
      setMsg('✗ VAT format looks invalid', 'crimson');
      lastResult = { valid: false, reason: 'format' };
      return;
    }

    // format OK → check real
    if (raw !== lastValue) {
      lastValue = raw;
      await verifyReal(raw);
    }
  }

  vatInput.addEventListener('input', onChange);
  onChange();

  // Soft gate: prevent payment click when we know it's invalid (format or VIES)
  // Users can still remove VAT or correct it to proceed.
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement)?.closest('.snipcart-button-primary');
    if (!btn) return;

    // If user filled VAT but it's invalid, stop & nudge
    const v = (vatInput.value || '').replace(/\\s+/g, '');
    if (v && lastResult && lastResult.valid === false && !inFlight) {
      e.preventDefault();
      e.stopPropagation();
      setMsg('Please enter a valid EU VAT number (or clear the field to continue).', 'crimson');
    }
  }, true);
});
`}
        </Script>

        {/* Diagnostics (light) */}
        <Script id="snipcart-diagnostics" strategy="afterInteractive">
          {`
            document.addEventListener('snipcart.ready', () => {
              console.log('[FilmRAID] snipcart-root present:', !!document.querySelector('snipcart-root'));
            });
          `}
        </Script>
      </head>

      <body className={`${sfProDisplay.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NavigationProvider>
            <Navbar />
            <div className="h-14 md:h-16" />
            <main>{children}</main>
            <CTA />
            <Footer />

            {/* Snipcart container (keep EMPTY; templates file injects fields) */}
            <div
              hidden
              id="snipcart"
              data-api-key={publicKey}
              data-config-add-product-behavior="open"
              data-config-modal-style="full"
            />

            {/* VAT/tax event wiring */}
            <SnipcartConfig />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
