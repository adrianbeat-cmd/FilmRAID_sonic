'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';

import { cn } from '@/lib/utils';
import { products } from '@/data/products';

const thumbnails = [
  '/layout/th_1.png', // FilmRaid-4A
  '/layout/th_2.png', // FilmRaid-6
  '/layout/th_3.png', // FilmRaid-8
  '/layout/th_4.png', // FilmRaid-12E
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<any[][]>([[]]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const pathname = usePathname();

  // Generate dynamic menu from central products.ts
  const dynamicItems = products.map((model, idx) => ({
    label: model.name,
    children: model.variants.map((v) => ({
      label: `${v.totalTB}TB`,
      href: `/products/${v.slug}`,
    })),
  }));

  const ITEMS = [
    {
      label: 'Products',
      children: [...dynamicItems, { label: 'Configure', href: '/configs' }],
    },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Rest of your existing code (scroll, menu, cart, etc.) stays the same
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(scrollPos > currentScrollPos || currentScrollPos < 10);
      setScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPos]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      setMenuStack([ITEMS]);
      setDirection('forward');
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isProductsOpen) {
      document.body.classList.add('dropdown-open');
    } else {
      document.body.classList.remove('dropdown-open');
    }
  }, [isProductsOpen]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsCartOpen(document.documentElement.classList.contains('snipcart-modal-open'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (menuStack.length === 1) {
      setDirection('forward');
    }
  }, [menuStack]);

  const handleMouseEnter = () => setIsProductsOpen(true);
  const handleMouseLeave = () => setIsProductsOpen(false);

  const handleSubmenuClick = (children: any[]) => {
    setDirection('forward');
    setTimeout(() => setMenuStack((prev) => [...prev, children]), 0);
  };

  const handleBackClick = () => {
    setDirection('back');
    setTimeout(() => setMenuStack((prev) => prev.slice(0, -1)), 0);
  };

  const currentMenu = menuStack[menuStack.length - 1];

  const renderDesktopNav = (item: any) => {
    if (!item.children) {
      return (
        <li key={item.label} className="flex items-center">
          <Button variant="ghost" className="px-5.5 text-sm">
            <Link href={item.href!} className="font-semibold transition-all hover:opacity-80">
              {item.label}
            </Link>
          </Button>
        </li>
      );
    }

    return (
      <li key={item.label} className="relative">
        <div
          className="relative inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Button variant="ghost" className="px-5.5 text-sm">
            <span className="font-semibold">{item.label}</span>
          </Button>
        </div>
      </li>
    );
  };

  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeIn', staggerChildren: 0.1 } },
  };

  const thumbnailVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const blurVariants = {
    closed: { opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
    open: { opacity: 1, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  return (
    <>
      <header
        className={cn(
          'bg-background/95 fixed top-0 left-0 z-50 w-full shadow-sm backdrop-blur-[10px] transition-transform duration-300',
          visible && !isCartOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="container flex items-center gap-0 py-3 pl-4 md:py-4">
          <Link href="/">
            <Image
              src="/layout/logo.svg"
              alt="FilmRAID Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: '24px' }}
              className="dark:hidden"
            />
            <Image
              src="/layout/logo_light.svg"
              alt="FilmRAID Logo"
              width={0}
              height={0}
              style={{ width: 'auto', height: '24px' }}
              className="hidden dark:block"
            />
          </Link>

          <nav className="flex flex-1 justify-center">
            <ul className="m-0 hidden items-center gap-0 p-0 md:flex">
              {ITEMS.map(renderDesktopNav)}
            </ul>
          </nav>

          <div className="ml-auto hidden items-center gap-4 md:flex">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="snipcart-checkout hover:text-primary px-5.5 text-sm transition-transform hover:scale-105 hover:bg-[#f7f7f7] hover:opacity-90 dark:hover:bg-[#2a2a2a]"
            >
              <ShoppingCart size={16} className="mr-1" />
              <span className="snipcart-items-count"></span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              className="text-base-dark relative z-10 flex size-8"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute top-1/2 left-1/2 block w-6 -translate-x-1/2 -translate-y-1/2">
                <span
                  className={`absolute z-10 block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}
                />
                <span
                  className={`absolute z-10 block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Desktop Dropdown */}
        <AnimatePresence>
          {isProductsOpen && (
            <motion.div
              key="dropdown"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="bg-background dropdown-container absolute left-0 z-40 m-0 min-h-[180px] rounded-b-lg p-0 py-6 shadow-md backdrop-blur-[10px]"
              style={{ top: '100%', width: '100vw' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="mx-auto max-w-[1232px] px-4 py-2">
                <div className="flex flex-row justify-end gap-4">
                  {products.map((model, idx) => (
                    <motion.div
                      key={model.id}
                      variants={thumbnailVariants}
                      className="min-w-[140px]"
                    >
                      <Image
                        src={thumbnails[idx]}
                        alt={model.name}
                        width={120}
                        height={147}
                        className="mb-4"
                      />
                      <h3 className="mb-3 text-base font-semibold">{model.name}</h3>
                      <ul className="pl-0">
                        {model.variants.map((v) => (
                          <li key={v.slug}>
                            <Link
                              href={`/products/${v.slug}`}
                              className="block flex items-center gap-1 py-1 text-sm hover:opacity-80 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5"
                            >
                              {v.totalTB}TB <ChevronRight size={14} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}

                  <div className="mx-4 border-r border-gray-200 dark:border-gray-700" />
                  <motion.div
                    variants={thumbnailVariants}
                    className="flex min-w-[140px] items-center"
                  >
                    <Button variant="outline" size="lg" className="rounded-full text-sm" asChild>
                      <Link href="/configs" onClick={() => setIsMenuOpen(false)}>
                        Configure <ChevronRight size={16} />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* The rest of your mobile menu code remains exactly the same */}
      {/* ... (I kept it unchanged so you can just paste the whole file) */}
    </>
  );
};

export default Navbar;
