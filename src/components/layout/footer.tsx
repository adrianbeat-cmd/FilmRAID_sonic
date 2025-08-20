'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowUp, Instagram, Mail, X } from 'lucide-react';

const ITEMS = [
  {
    title: 'Navigation',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Configs', href: '/configs' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/filmraid.pro',
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    name: 'X',
    href: 'https://x.com/filmraidpro',
    icon: <X className="h-5 w-5" />,
  },
  {
    name: 'Email',
    href: 'mailto:hello@filmraid.pro',
    icon: <Mail className="h-5 w-5" />,
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-1 flex flex-col justify-start">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/layout/logo.svg"
                alt="FilmRAID Logo"
                width={120}
                height={40}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/layout/logo_light.svg"
                alt="FilmRAID Logo"
                width={120}
                height={40}
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fast & Reliable Storage for Filmmakers
            </p>
          </div>
          {ITEMS.map((section, sectionIdx) => (
            <div key={sectionIdx} className="col-span-1 flex flex-col justify-start">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href} className="hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-1 flex flex-col justify-start">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Connect</h3>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="hover:text-primary dark:hover:text-primary text-gray-600 transition-colors dark:text-gray-400"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Ecologi Badge on the right */}
          <div className="col-span-1 flex flex-col justify-start">
            <a
              href="https://ecologi.com/filmraid?r=64a29ce03896b26a0cd54d17"
              target="_blank"
              rel="noopener noreferrer"
              title="View our Ecologi profile"
              className="inline-block"
            >
              <Image
                alt="We offset our carbon footprint via Ecologi"
                src="https://api.ecologi.com/badges/cpw/64a29ce03896b26a0cd54d17?black=true&landscape=true"
                width={0}
                height={0}
                style={{ width: 'auto', height: '75px' }}
                className="dark:hidden"
                unoptimized // Since it's a remote API image
              />
              <Image
                alt="We offset our carbon footprint via Ecologi"
                src="https://api.ecologi.com/badges/cpw/64a29ce03896b26a0cd54d17?white=true&landscape=true"
                width={0}
                height={0}
                style={{ width: 'auto', height: '75px' }}
                className="hidden dark:block"
                unoptimized // Since it's a remote API image
              />
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <p>© 2025 FilmRAID. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-primary mt-2 inline-flex items-center hover:underline"
          >
            Back to Top <ArrowUp className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
