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
  const publicKey = process.env.NEXT_PUBLIC_SNIPCART_PUBLIC_API_KEY ?? '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Snipcart v3.6 CSS */}
        <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.css" />

        {/* Define settings BEFORE loading the script (no templatesUrl to keep stock UI) */}
        <Script
          id="snipcart-settings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.SnipcartSettings = {
                publicApiKey: "${publicKey}",
                version: "3.6.0",
                loadStrategy: "always",
                modalStyle: "side",
                addProductBehavior: "none",
                timeoutDuration: 15000
              };
            `,
          }}
        />

        {/* Snipcart v3.6 script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js"
          strategy="afterInteractive"
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

            {/* Snipcart container (keep minimal & let settings carry the key) */}
            <div id="snipcart" hidden>
              <div id="snipcart-custom-fields">
                <fieldset className="snipcart-form__set">
                  {/* Company FIRST */}
                  <div className="snipcart-form__field">
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

                  {/* EU VAT SECOND */}
                  <div className="snipcart-form__field">
                    <label className="snipcart-form__label" htmlFor="vatNumber">
                      EU VAT Number
                    </label>
                    <input
                      className="snipcart-form__input"
                      name="vatNumber"
                      id="vatNumber"
                      type="text"
                      placeholder="e.g. ESB12345678"
                      data-snipcart-custom-field
                      data-snipcart-custom-field-name="vatNumber"
                      data-snipcart-custom-field-type="string"
                      data-snipcart-custom-field-required="false"
                      data-snipcart-custom-field-section="billing"
                    />
                    <span
                      id="vat-message"
                      style={{ display: 'block', marginTop: '0.375rem', fontSize: '0.875rem' }}
                    />
                  </div>
                </fieldset>
              </div>
            </div>

            {/* VAT validation + metadata wiring */}
            <Script id="snipcart-vat-validation" strategy="afterInteractive">
              {`
                (function () {
                  const EU_CODES = new Set([
                    "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
                    "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
                  ]);

                  function formatMsg(el, ok, msg) {
                    el.textContent = msg || "";
                    el.style.color = ok ? "#137333" : "#B00020";
                  }

                  function basicVatFormatOk(v) {
                    if (!v) return false;
                    const val = v.toUpperCase().replace(/\\s|-/g, "");
                    // Starts with 2-letter country code, then 8-12 alphanumerics
                    if (!/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(val)) return false;
                    const cc = val.slice(0,2);
                    return EU_CODES.has(cc);
                  }

                  document.addEventListener("snipcart.ready", function () {
                    const input = document.getElementById("vatNumber");
                    const message = document.getElementById("vat-message");
                    if (!input || !message || !window.Snipcart) return;

                    async function pushMeta(vat, valid) {
                      try {
                        const cart = await window.Snipcart.api.cart.get();
                        await window.Snipcart.api.cart.update({
                          metadata: { ...cart.metadata, vatNumber: vat || "", vatValid: !!valid }
                        });
                      } catch (e) {
                        console.error("VAT metadata update failed", e);
                      }
                    }

                    async function validateAndStore() {
                      const raw = input.value.trim();
                      if (!raw) {
                        formatMsg(message, true, "");
                        pushMeta("", false);
                        return;
                      }
                      const ok = basicVatFormatOk(raw);
                      if (!ok) {
                        formatMsg(message, false, "Invalid EU VAT format. Use country code + number, e.g. ESB12345678.");
                        pushMeta(raw, false);
                        return;
                      }
                      formatMsg(message, true, "VAT format looks valid. We'll apply the correct tax at checkout.");
                      pushMeta(raw, true);
                    }

                    input.addEventListener("blur", validateAndStore);
                    input.addEventListener("change", validateAndStore);
                    window.Snipcart.events.on("billingaddress.changed", validateAndStore);
                  });
                })();
              `}
            </Script>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
