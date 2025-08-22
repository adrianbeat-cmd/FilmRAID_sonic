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
import { ThemeProvider } from '@/components/theme-provider';

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
    images: [{ url: 'https://www.filmraid.pro/images/preview.jpg', width: 300, height: 200 }],
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
  // Public key you provided (ok to expose — it’s public)
  const SNIPCART_PUBLIC_KEY =
    'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Snipcart loader + settings (pinned to v3.6.0, NO custom templates URL) */}
        <Script
          id="snipcart-settings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.SnipcartSettings = {
                publicApiKey: '${SNIPCART_PUBLIC_KEY}',
                loadStrategy: 'on-user-interaction',
                addProductBehavior: 'open',         // auto-open cart after add
                modalStyle: 'side',
                version: '3.6.0'
              };

              (()=>{var c,d;(d=(c=window.SnipcartSettings).version)!=null||(c.version="3.0");
              var s,S;(S=(s=window.SnipcartSettings).timeoutDuration)!=null||(s.timeoutDuration=2750);
              var l,p;(p=(l=window.SnipcartSettings).domain)!=null||(l.domain="cdn.snipcart.com");
              var w,u;(u=(w=window.SnipcartSettings).protocol)!=null||(w.protocol="https");
              var f=window.SnipcartSettings.version.includes("v3.0.0-ci")
                || (window.SnipcartSettings.version!="3.0"
                    && window.SnipcartSettings.version.localeCompare("3.4.0",void 0,{numeric:!0,sensitivity:"base"})===-1),
                  m=["focus","mouseover","touchmove","scroll","keydown"];
              window.LoadSnipcart=o; document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r();
              function r(){window.SnipcartSettings.loadStrategy==="on-user-interaction"?
                (m.forEach(t=>document.addEventListener(t,o)), setTimeout(o,window.SnipcartSettings.timeoutDuration)) : o()}
              var a=!1; function o(){if(a)return; a=!0; let t=document.head,
                e=document.querySelector("#snipcart"),
                i=document.querySelector(\`src[src^="\${window.SnipcartSettings.protocol}://\${window.SnipcartSettings.domain}"][src$="snipcart.js"]\`),
                n=document.querySelector(\`link[href^="\${window.SnipcartSettings.protocol}://\${window.SnipcartSettings.domain}"][href$="snipcart.css"]\`);
                e||(e=document.createElement("div"),e.id="snipcart",e.setAttribute("hidden","true"),document.body.appendChild(e));
                v(e);
                i||(i=document.createElement("script"),i.src=\`\${window.SnipcartSettings.protocol}://\${window.SnipcartSettings.domain}/themes/v\${window.SnipcartSettings.version}/default/snipcart.js\`,i.async=!0,t.appendChild(i));
                n||(n=document.createElement("link"),n.rel="stylesheet",n.type="text/css",n.href=\`\${window.SnipcartSettings.protocol}://\${window.SnipcartSettings.domain}/themes/v\${window.SnipcartSettings.version}/default/snipcart.css\`,t.prepend(n));
                m.forEach(g=>document.removeEventListener(g,o))
              }
              function v(t){
                !f || (
                  t.dataset.apiKey=window.SnipcartSettings.publicApiKey,
                  window.SnipcartSettings.addProductBehavior&&(t.dataset.configAddProductBehavior=window.SnipcartSettings.addProductBehavior),
                  window.SnipcartSettings.modalStyle&&(t.dataset.configModalStyle=window.SnipcartSettings.modalStyle)
                )
              }})();
            `,
          }}
        />
      </head>

      <body className={`${sfProDisplay.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NavigationProvider>
            <Navbar />
            <div className="h-14 md:h-16" />
            <main>{children}</main>
            <CTA />
            <Footer />

            {/* Snipcart container (built-in templates; no templatesUrl) */}
            <div
              hidden
              id="snipcart"
              data-api-key={SNIPCART_PUBLIC_KEY}
              data-config-add-product-behavior="open"
              data-config-modal-style="side"
            >
              {/* Custom billing fields: Company (above) + EU VAT */}
              <div id="snipcart-custom-fields">
                <fieldset className="snipcart-form__set">
                  <div className="snipcart-form__field" id="company-field">
                    <label className="snipcart-form__label" htmlFor="companyName">
                      Company Name (Optional)
                    </label>
                    <input
                      className="snipcart-form__input"
                      name="companyName"
                      id="companyName"
                      type="text"
                      placeholder="Your Company"
                      data-snipcart-custom-field
                      data-snipcart-custom-field-name="Company Name"
                      data-snipcart-custom-field-type="string"
                      data-snipcart-custom-field-required="false"
                      data-snipcart-custom-field-section="billing"
                    />
                  </div>

                  <div className="snipcart-form__field" id="vat-field">
                    <label className="snipcart-form__label" htmlFor="vatNumber">
                      EU VAT Number
                    </label>
                    <input
                      className="snipcart-form__input"
                      name="vatNumber"
                      id="vatNumber"
                      type="text"
                      placeholder="e.g. ESB10680478"
                      data-snipcart-custom-field
                      data-snipcart-custom-field-name="vatNumber"
                      data-snipcart-custom-field-type="string"
                      data-snipcart-custom-field-required="false"
                      data-snipcart-custom-field-section="billing"
                    />
                    <span id="vat-message" style={{ display: 'block', marginTop: '0.25rem' }} />
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Auto-open cart on add + working VAT format check + place fields after Postal Code */}
            <Script id="snipcart-hooks" strategy="afterInteractive">
              {`
                document.addEventListener('snipcart.ready', function () {
                  // Fallback: open cart after an item is added
                  try {
                    if (window.Snipcart && window.Snipcart.events) {
                      window.Snipcart.events.on('item.added', function () {
                        if (window.Snipcart.api?.theme?.cart?.open) {
                          window.Snipcart.api.theme.cart.open();
                        }
                      });
                    }
                  } catch (_) {}

                  const root = document.getElementById('snipcart');
                  if (!root) return;

                  // Move Company + VAT just after the Postal Code in Billing
                  let placed = false;
                  function placeFields() {
                    if (placed) return;
                    const postal = root.querySelector('input[name="postalCode"]');
                    const companyWrap = root.querySelector('#company-field');
                    const vatWrap = root.querySelector('#vat-field');
                    if (postal && companyWrap && vatWrap) {
                      const postalField = postal.closest('.snipcart-form__field') || postal.parentElement;
                      if (postalField && postalField.insertAdjacentElement) {
                        postalField.insertAdjacentElement('afterend', companyWrap);
                        companyWrap.insertAdjacentElement('afterend', vatWrap);
                        placed = true;
                      }
                    }
                  }

                  const mo = new MutationObserver(function (muts) {
                    if (muts.some(m => m.addedNodes && m.addedNodes.length)) {
                      placeFields();
                    }
                  });
                  mo.observe(root, { childList: true, subtree: true });

                  // Delegated VAT format validation (works inside Snipcart's DOM)
                  function validateVATValue(raw) {
                    if (!raw) return null;
                    const v = raw.replace(/\\s+/g, '').toUpperCase();
                    // Spain (ES): CIF/NIF patterns we commonly see
                    const esOK = /^ES[A-Z]\\d{8}$/.test(v) || /^ES\\d{8}[A-Z]$/.test(v) || /^ES[A-Z]\\d{7}[A-Z]$/.test(v);
                    if (esOK) return true;
                    // Generic fallback: CC + 8-12 alphanumerics
                    return /^[A-Z]{2}[0-9A-Z]{8,12}$/.test(v);
                  }

                  function writeVATMessage(input) {
                    const msg = root.querySelector('#vat-message');
                    if (!msg) return;
                    const raw = (input && input.value) || '';
                    const ok = validateVATValue(raw);
                    if (ok === null) { msg.textContent = ''; return; }
                    msg.textContent = ok ? '✓ VAT format looks valid' : '✗ VAT format looks invalid';
                    msg.style.color = ok ? '#188038' : '#B3261E';
                  }

                  root.addEventListener('input', function (ev) {
                    const t = ev.target;
                    if (t && t.id === 'vatNumber') writeVATMessage(t);
                  });
                  root.addEventListener('blur', function (ev) {
                    const t = ev.target;
                    if (t && t.id === 'vatNumber') writeVATMessage(t);
                  }, true);
                });
              `}
            </Script>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
