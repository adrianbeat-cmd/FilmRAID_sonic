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

        {/* Snipcart settings: full-page modal + open on add + templates file */}
        <Script
          id="snipcart-settings"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.SnipcartSettings = {
                publicApiKey: "${publicKey}",
                loadStrategy: "always",
                modalStyle: "full",
                addProductBehavior: "open",
                timeoutDuration: 2000,
                templatesUrl: "/snipcart-templates.html"
              };
            `,
          }}
        />

        {/* Snipcart script */}
        <Script
          src="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.js"
          strategy="afterInteractive"
        />

        {/* Live EU VAT format check (visual only) */}
        <Script id="eu-vat-format-check" strategy="afterInteractive">
          {`
            document.addEventListener("snipcart.ready", () => {
              const vatInput = document.querySelector('#vatNumber');
              const vatMsg = document.querySelector('#vat-message');
              if (!vatInput || !vatMsg) return;

              const EU_VAT_REGEX = /^[A-Z]{2}[A-Z0-9]{8,12}$/i;

              function update() {
                const v = (vatInput.value || '').replace(/\\s+/g, '');
                if (!v) { vatMsg.textContent = ''; vatMsg.style.color = ''; return; }
                if (EU_VAT_REGEX.test(v)) {
                  vatMsg.textContent = '✓ VAT format looks valid';
                  vatMsg.style.color = 'green';
                } else {
                  vatMsg.textContent = '✗ VAT format looks invalid';
                  vatMsg.style.color = 'crimson';
                }
              }
              vatInput.addEventListener('input', update);
              update();
            });
          `}
        </Script>

        {/* Diagnostics */}
        <Script id="snipcart-diagnostics" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', () => {
              const roots = document.querySelectorAll('#snipcart');
              if (roots.length !== 1) {
                console.warn('[FilmRAID] Snipcart roots found:', roots.length, '→ must be exactly 1');
              } else {
                console.log('[FilmRAID] Single Snipcart root OK');
              }
            });
            document.addEventListener('snipcart.ready', () => {
              const billingFields = document.querySelectorAll('#snipcart [name="companyName"], #snipcart [name="vatNumber"]');
              console.log('[FilmRAID] Billing custom fields count:', billingFields.length);
              console.log('[FilmRAID] VAT input present:', !!document.querySelector('#snipcart #vatNumber'));
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
