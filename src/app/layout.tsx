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

        {/* Snipcart settings (point to our template file) */}
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

        {/* Guard history state so Snipcart + Next router don't clash */}
        <Script id="history-guard" strategy="beforeInteractive">
          {`
  (function () {
    try {
      var _push = history.pushState, _replace = history.replaceState;
      history.pushState = function (state, title, url) {
        if (state != null && (typeof state !== 'object' && typeof state !== 'function')) {
          state = { value: state };
        }
        return _push.apply(this, [state, title, url]);
      };
      history.replaceState = function (state, title, url) {
        if (state != null && (typeof state !== 'object' && typeof state !== 'function')) {
          state = { value: state };
        }
        return _replace.apply(this, [state, title, url]);
      };
    } catch (_) {}
  })();
          `}
        </Script>

        {/* Snipcart script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js"
          strategy="afterInteractive"
        />

        {/* EU VAT check (robust attach + Netlify Function) */}
        <Script id="eu-vat-check" strategy="afterInteractive">
          {`
(function () {
  const VAT_RE = /^[A-Z]{2}[A-Z0-9]{8,14}$/;

  // Utility
  const $ = (sel, root) => (root || document).querySelector(sel);

  function setMsg(el, text, color) {
    if (!el) return;
    el.textContent = text || '';
    el.style.display = 'block';
    el.style.marginTop = '0.25rem';
    el.style.fontWeight = '600';
    el.style.color = color || '';
  }

  async function verifyVat(vat) {
    try {
      const res = await fetch('/.netlify/functions/vat-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vat }),
      });
      const json = await res.json();
      if (!json.ok) return { state: 'error' };
      return json.valid ? { state: 'valid', info: json } : { state: 'invalid', info: json };
    } catch {
      return { state: 'error' };
    }
  }

  function bindOnce() {
    // Look inside the cart container (preferred) and globally as fallback
    const root = document.getElementById('snipcart') || document;
    const input = $('#vatNumber', root) || $('input[name="vatNumber"]', root);
    const msg   = $('#vat-message', root);

    if (!input || !msg) return false;

    let last = '';
    let inflight = false;
    let lastResult = null;
    let t;

    const run = async () => {
      const raw = String(input.value || '').replace(/\\s+/g, '').toUpperCase();
      if (!raw) { setMsg(msg, 'Optional. Add your EU VAT to remove VAT in intra-EU B2B.', '#f59e0b'); lastResult = null; return; }
      if (!VAT_RE.test(raw)) { setMsg(msg, '✕ VAT format looks invalid (e.g. ESB10680478).', '#dc2626'); lastResult = { valid: false, reason: 'format' }; return; }

      if (raw === last && lastResult) return;
      last = raw;

      inflight = true;
      setMsg(msg, 'Checking VAT…', '#555');
      const { state, info } = await verifyVat(raw);
      inflight = false;

      if (state === 'error') { setMsg(msg, 'Validation service unavailable. You can proceed or try again.', '#f59e0b'); lastResult = null; return; }
      if (state === 'invalid') { setMsg(msg, '✕ VAT number not valid in VIES.', '#dc2626'); lastResult = { valid: false }; return; }

      // valid
      const suffix = info && info.name ? ' — ' + info.name : '';
      setMsg(msg, '✓ VAT validated' + suffix, '#16a34a');
      lastResult = { valid: true, info };
    };

    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 350); });
    input.addEventListener('blur', run);
    run();

    // Block the "Continue" button only if VAT is present AND invalid
    document.addEventListener('click', function (e) {
      const el = e && e.target instanceof Element ? e.target : null;
      const btn = el ? el.closest('#snipcart .snipcart-button-primary') : null;
      if (!btn) return;

      const v = String(input.value || '').replace(/\\s+/g, '').toUpperCase();
      if (v && lastResult && lastResult.valid === false && !inflight) {
        e.preventDefault();
        e.stopPropagation();
        setMsg(msg, 'Please enter a valid EU VAT number (or clear the field).', '#dc2626');
      }
    }, true);

    return true;
  }

  function arm() {
    // Try immediately
    if (bindOnce()) return;

    // Watch for the VAT field to appear
    const obs = new MutationObserver(() => { if (bindOnce()) obs.disconnect(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // Also re-try on Snipcart route changes
    if (window.Snipcart?.events?.on) {
      window.Snipcart.events.on('route.changed', () => { setTimeout(bindOnce, 150); });
    }
  }

  // Start once Snipcart is ready or soon after
  if (document.readyState !== 'loading') arm();
  else document.addEventListener('DOMContentLoaded', arm);
  document.addEventListener('snipcart.ready', arm);
})();
          `}
        </Script>

        {/* Diagnostics (optional) */}
        <Script id="snipcart-diagnostics" strategy="afterInteractive">
          {`
    document.addEventListener('snipcart.ready', () => {
      const check = (label) => {
        console.log('[FilmRAID]', label || 'check', 'snipcart-root present:', !!document.querySelector('snipcart-root'));
      };
      check('ready');
      if (window.Snipcart && window.Snipcart.events && window.Snipcart.events.on) {
        Snipcart.events.on('cart.opened',   () => check('cart.opened'));
        Snipcart.events.on('route.changed', () => check('route.changed'));
      }
      try {
        new MutationObserver(() => check('mutation'))
          .observe(document.body, { childList: true, subtree: true });
      } catch {}
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
