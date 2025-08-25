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

        {/* Snipcart settings (must load BEFORE snipcart.js) */}
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
        // cache-bust so Snipcart fetches the latest template
        templatesUrl: "/snipcart-templates.html?v=20250825-1",
        version: "3.6.0"
      };
    `,
          }}
        />

        {/* Robust history guard (self-reinstalls) */}
        <Script id="history-guard" strategy="beforeInteractive">
          {`
  (function () {
    try {
      var H = window.history;
      var WRAP_FLAG = '__frWrapped';

      function wrap(fn) {
        var bound = fn.bind(H);
        function safe(state, title, url) {
          if (state != null && (typeof state !== 'object' && typeof state !== 'function')) {
            state = { value: state };
          }
          return bound(state, title, url);
        }
        try { Object.defineProperty(safe, WRAP_FLAG, { value: true }); } catch (_) {}
        return safe;
      }

      function install() {
        if (H.pushState && !H.pushState[WRAP_FLAG]) H.pushState = wrap(H.pushState);
        if (H.replaceState && !H.replaceState[WRAP_FLAG]) H.replaceState = wrap(H.replaceState);
      }

      install();
      var tries = 0;
      var id = setInterval(function () {
        install();
        if (++tries > 50) clearInterval(id); // ~5s
      }, 100);

      addEventListener('DOMContentLoaded', install);
    } catch (_) {}
  })();
          `}
        </Script>

        {/* Snipcart script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js"
          strategy="afterInteractive"
        />

        {/* EU VAT check — resilient to route changes & shadow DOM rebuilds */}
        <Script id="eu-vat-check" strategy="afterInteractive">{`
(function () {
  const VAT_RE = /^[A-Z]{2}[A-Z0-9]{8,14}$/;
  let boundInput = null; // the real <input> inside <snipcart-input>

  function findVatInput() {
    // Try native
    let el = document.querySelector('input#vatNumber, input[name="vatNumber"]');
    if (el) return el;
    // Try shadow DOM under <snipcart-input id="vatNumber">
    const sc = document.querySelector('snipcart-input#vatNumber, snipcart-field[name="vatNumber"] snipcart-input#vatNumber');
    if (sc && sc.shadowRoot) {
      const inner = sc.shadowRoot.querySelector('input,textarea');
      if (inner) return inner;
    }
    // Fallback: inspect all snipcart-inputs
    for (const node of document.querySelectorAll('snipcart-input')) {
      if (node.shadowRoot) {
        const inner = node.shadowRoot.querySelector('input[name="vatNumber"],textarea[name="vatNumber"],input,textarea');
        if (inner) return inner;
      }
    }
    return null;
  }

  function msgEl(){ return document.querySelector('#vat-message'); }
  function setMsg(text, color){
    const el = msgEl(); if (!el) return;
    el.textContent = text || '';
    el.style.display = 'block';
    el.style.marginTop = '0.25rem';
    el.style.fontWeight = '600';
    el.style.color = color || '';
  }

  async function verifyVat(vat){
    try{
      const r = await fetch('/.netlify/functions/vat-verify', {
        method: 'POST', headers: {'content-type':'application/json'},
        body: JSON.stringify({ vat })
      });
      const j = await r.json();
      if (!j.ok) return { state:'error' };
      return j.valid ? { state:'valid', info:j } : { state:'invalid', info:j };
    }catch{ return { state:'error' }; }
  }

  function bind(force=false){
    const input = findVatInput();
    const msg = msgEl();
    if (!input || !msg) return false;

    // re-bind if new input or forced
    if (boundInput === input && !force && input.__frBound) return true;
    // clean previous
    if (boundInput && boundInput.__frUnsub) { try{ boundInput.__frUnsub(); }catch{} }
    boundInput = input;

    let last = '';
    let inflight = false;
    let lastResult = null;
    let t;

    const run = async () => {
      const raw = String(input.value || '').replace(/\\s+/g, '').toUpperCase();
      if (!raw){ setMsg('Optional. Add your EU VAT to remove VAT in intra-EU B2B.', '#f59e0b'); lastResult=null; return; }
      if (!VAT_RE.test(raw)){ setMsg('✕ VAT format looks invalid (e.g. ESB10680478).', '#dc2626'); lastResult={valid:false,reason:'format'}; return; }
      if (raw===last && lastResult) return;
      last = raw;
      inflight = true;
      setMsg('Checking VAT…', '#555');
      const { state, info } = await verifyVat(raw);
      inflight = false;
      if (state==='error'){ setMsg('Validation service unavailable. You can proceed or try again.', '#f59e0b'); lastResult=null; return; }
      if (state==='invalid'){ setMsg('✕ VAT number not valid in VIES.', '#dc2626'); lastResult={valid:false}; return; }
      const suffix = info && info.name ? ' — ' + info.name : '';
      setMsg('✓ VAT validated' + suffix, '#16a34a');
      lastResult = { valid:true, info };
    };

    const onInput = () => { clearTimeout(t); t = setTimeout(run, 300); };
    const onBlur  = () => run();

    input.addEventListener('input', onInput, true);
    input.addEventListener('blur', onBlur, true);

    // block primary submit only when VAT present AND invalid
    const onClick = (e) => {
      const btn = e.target instanceof Element ? e.target.closest('.snipcart-button-primary') : null;
      if (!btn) return;
      const v = String(input.value || '').replace(/\\s+/g, '').toUpperCase();
      if (v && lastResult && lastResult.valid===false){
        e.preventDefault(); e.stopPropagation();
        setMsg('Please enter a valid EU VAT number (or clear the field).', '#dc2626');
      }
    };
    document.addEventListener('click', onClick, true);

    input.__frBound = true;
    input.__frUnsub = () => {
      input.removeEventListener('input', onInput, true);
      input.removeEventListener('blur', onBlur, true);
      document.removeEventListener('click', onClick, true);
      input.__frBound = false;
    };

    run();
    return true;
  }

  function arm(){
    // initial
    bind(true);
    // re-bind on every route change (e.g., navigating steps)
    if (window.Snipcart?.events?.on){
      window.Snipcart.events.on('theme.routechanged', () => setTimeout(() => bind(true), 120));
    }
    // also watch DOM mutations just in case
    const mo = new MutationObserver(() => bind());
    mo.observe(document.body, {subtree:true, childList:true});
  }

  if (document.readyState!=='loading') arm();
  else document.addEventListener('DOMContentLoaded', arm);
  document.addEventListener('snipcart.ready', arm);
})();
`}</Script>
      </head>

      <body className={`${sfProDisplay.variable} antialiased`}>
        {/* Snipcart container */}
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
