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

        {/* Snipcart settings (no templatesUrl; keep simple) */}
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
        timeoutDuration: 4000,
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

        {/* EU VAT check (format + real) */}
        <Script id="eu-vat-check" strategy="afterInteractive">
          {`
(function () {
  function queryDeepAll(selector, root = document) {
    const results = [];
    const seen = new Set();
    function walk(node) {
      if (!node || seen.has(node)) return;
      seen.add(node);
      if (node.querySelectorAll) {
        node.querySelectorAll(selector).forEach((el) => results.push(el));
        node.querySelectorAll('*').forEach((el) => {
          if (el.shadowRoot) walk(el.shadowRoot);
        });
      }
      if (node instanceof ShadowRoot) {
        node.childNodes.forEach((ch) => {
          if (ch.shadowRoot) walk(ch.shadowRoot);
        });
      }
    }
    walk(root);
    return results;
  }

  function bindVatHandlers() {
    const input = queryDeepAll('input#vatNumber, input[name="vatNumber"]')[0];
    const msg   = queryDeepAll('#vat-message')[0];
    if (!input || !msg) return false;

    const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;
    let lastValue = '';
    let lastResult = null;
    let inFlight = false;

    function setMsg(text, color) {
      msg.textContent = text || '';
      msg.style.color = color || '';
    }

    async function verifyReal(v) {
      try {
        inFlight = true;
        setMsg('Checking VAT…', '#555');
        const res = await fetch('/api/vat-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vat: v }),
        });
        const json = await res.json();
        inFlight = false;

        if (!json.ok) {
          lastResult = null;
          setMsg("Couldn't verify VAT right now (service busy).", 'orange');
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
        setMsg("Couldn't verify VAT right now (network).", 'orange');
      }
    }

    function onChange() {
      const raw = String(input.value || '').replace(/\\s+/g, '').toUpperCase();
      if (!raw) { setMsg(''); lastResult = null; return; }

      if (!EU_VAT_REGEX.test(raw)) {
        setMsg('✗ VAT format looks invalid', 'crimson');
        lastResult = { valid: false, reason: 'format' };
        return;
      }

      if (raw !== lastValue) {
        lastValue = raw;
        verifyReal(raw);
      }
    }

    input.addEventListener('input', onChange, true);
    onChange();

    document.addEventListener('click', function (e) {
      const el = e && e.target instanceof Element ? e.target : null;
      const btn = el ? el.closest('.snipcart-button-primary') : null;
      if (!btn) return;

      const v = String(input.value || '').replace(/\\s+/g, '');
      if (v && lastResult && lastResult.valid === false && !inFlight) {
        e.preventDefault();
        e.stopPropagation();
        setMsg('Please enter a valid EU VAT number (or clear the field).', 'crimson');
      }
    }, true);

    return true;
  }

  function arm() {
    const delays = [80, 250, 600, 1200, 2000, 3500];
    let ok = bindVatHandlers();
    delays.forEach((ms) => setTimeout(() => { if (!ok) ok = bindVatHandlers(); }, ms));

    if (window.Snipcart && window.Snipcart.events && window.Snipcart.events.on) {
      window.Snipcart.events.on('route.changed', function () {
        setTimeout(bindVatHandlers, 200);
      });
    }
  }

  // give Snipcart time to boot and attach its root
  document.addEventListener('snipcart.ready', () => setTimeout(arm, 200));
})();
`}
        </Script>

        {/* Diagnostics */}
        <Script id="snipcart-diagnostics" strategy="afterInteractive">
          {`
            document.addEventListener('snipcart.ready', () => {
              setTimeout(() => {
                console.log('[FilmRAID] snipcart-root present:', !!document.querySelector('snipcart-root'));
              }, 600);
            });
          `}
        </Script>
      </head>

      <body className={`${sfProDisplay.variable} antialiased`}>
        {/* Snipcart container MUST be present exactly once and not conditionally rendered */}
        <div
          hidden
          id="snipcart"
          data-api-key={publicKey}
          data-config-add-product-behavior="open"
          data-config-modal-style="full"
        />

        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NavigationProvider>
            <Navbar />
            <div className="h-14 md:h-16" />
            <main>{children}</main>
            <CTA />
            <Footer />
            <SnipcartConfig />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
