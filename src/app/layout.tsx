import { ReactNode } from 'react';

import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './globals.css';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { NavigationProvider } from '@/components/navigation-provider';
import CTA from '@/components/sections/cta';
import Snipcart from '@/components/Snipcart';
import SnipcartConfig from '@/components/SnipcartConfig';
import { ThemeProvider } from '@/components/theme-provider';

const sfProDisplay = localFont({
  src: [
    {
      path: './fonts/SF-Pro-Display-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/SF-Pro-Display-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/SF-Pro-Display-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/SF-Pro-Display-Bold.otf',
      weight: '700',
      style: 'normal',
    },
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
  robots: {
    index: true,
    follow: true,
  },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.6.0/default/snipcart.css" />
      </head>
      <body className={`${sfProDisplay.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <NavigationProvider>
            <Navbar />
            <div className="h-14 md:h-16" />
            <main>{children}</main>
            <CTA />
            <Footer />
            <Snipcart />
            <SnipcartConfig />
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
