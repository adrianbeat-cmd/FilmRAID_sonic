'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Instagram, Mail, X } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'Configs', href: '/configs' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/filmraid.pro',
    icon: <Instagram className="h-4 w-4" />,
  },
  {
    name: 'X',
    href: 'https://x.com/filmraidpro',
    icon: <X className="h-4 w-4" />,
  },
  {
    name: 'Email',
    href: 'mailto:hello@filmraid.pro',
    icon: <Mail className="h-4 w-4" />,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-6 py-16 md:px-12">
        {/* Top row — logo + nav */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Logo */}
          <Link href="/" className="inline-block shrink-0">
            <Image
              src="/layout/logo.svg"
              alt="FilmRAID Logo"
              width={120}
              height={32}
              className="h-7 w-auto dark:hidden"
            />
            <Image
              src="/layout/logo_light.svg"
              alt="FilmRAID Logo"
              width={120}
              height={32}
              className="hidden h-7 w-auto dark:block"
            />
          </Link>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
            {/* Navigation */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                Navigation
              </p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-opacity hover:opacity-60 dark:text-gray-400"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                Legal
              </p>
              <ul className="space-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-opacity hover:opacity-60 dark:text-gray-400"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                Connect
              </p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="text-gray-500 transition-opacity hover:opacity-60 dark:text-gray-400"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
                Company
              </p>
              <address className="text-sm leading-relaxed text-gray-600 not-italic dark:text-gray-400">
                The DIT World Company S.L.U.
                <br />
                Carrer del Valles 55, 1-2
                <br />
                08030 Barcelona, Spain
                <br />
                VAT: ESB10680478
              </address>
              <a
                href="mailto:hello@filmraid.pro"
                className="mt-3 block text-sm text-gray-600 transition-opacity hover:opacity-60 dark:text-gray-400"
              >
                hello@filmraid.pro
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-gray-200 pt-8 sm:flex-row sm:items-center dark:border-gray-800">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} FilmRAID. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://ecologi.com/filmraid?r=64a29ce03896b26a0cd54d17"
              target="_blank"
              rel="noopener noreferrer"
              title="View our Ecologi profile"
            >
              <Image
                alt="We offset our carbon footprint via Ecologi"
                src="https://api.ecologi.com/badges/cpw/64a29ce03896b26a0cd54d17?black=true&landscape=true"
                width={0}
                height={0}
                style={{ width: 'auto', height: '40px' }}
                className="dark:hidden"
                unoptimized
              />
              <Image
                alt="We offset our carbon footprint via Ecologi"
                src="https://api.ecologi.com/badges/cpw/64a29ce03896b26a0cd54d17?white=true&landscape=true"
                width={0}
                height={0}
                style={{ width: 'auto', height: '40px' }}
                className="hidden dark:block"
                unoptimized
              />
            </a>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-gray-400 transition-opacity hover:opacity-60"
            >
              ↑ Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
