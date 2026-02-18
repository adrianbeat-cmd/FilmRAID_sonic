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

const thumbnails = ['/layout/th_1.png', '/layout/th_2.png', '/layout/th_3.png', '/layout/th_4.png'];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<any[][]>([]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const pathname = usePathname();

  // Dynamic Products menu
  const dynamicProducts = products.map((model, idx) => ({
    label: model.name,
    children: model.variants.map((v) => ({
      label: `${v.totalTB}TB`,
      href: `/products/${v.slug}`,
    })),
  }));

  const ITEMS = [
    {
      label: 'Products',
      children: [...dynamicProducts, { label: 'Configure', href: '/configs' }],
    },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const current = window.pageYOffset;
      setVisible(scrollPos > current || current < 10);
      setScrollPos(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPos]);

  // Mobile menu body lock
  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      setMenuStack([ITEMS]);
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      setMenuStack([]);
    }
  }, [isMenuOpen]);

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

  const currentMenu = menuStack[menuStack.length - 1] || [];

  // Desktop render
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

        {/* Desktop Dropdown with 24TB */}
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

      {/* FULL MOBILE MENU RESTORED */}
      <div
        className={cn(
          'fixed inset-x-0 top-14 bottom-0 z-[60] overflow-hidden md:hidden',
          isMenuOpen ? 'visible' : 'invisible',
        )}
      >
        <div
          className={cn(
            'bg-base-dark/85 dark:bg-base-dark/25 absolute inset-0 z-10 backdrop-blur-[10px] transition-opacity duration-500 ease-out',
            !isMenuOpen && 'opacity-0',
          )}
          onClick={() => setIsMenuOpen(false)}
        />
        <div className="bg-background absolute top-0 right-0 z-50 h-full w-full">
          <AnimatePresence>
            <motion.div
              key={menuStack.length}
              variants={getPanelVariants()}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col p-6"
            >
              {menuStack.length > 1 && (
                <button
                  onClick={handleBackClick}
                  className="mb-6 flex items-center text-left text-xl font-medium"
                >
                  <ChevronLeft size={28} className="mr-2" /> Back
                </button>
              )}
              <ul className="flex flex-col space-y-6">
                {currentMenu.map((item: any, index: number) => (
                  <React.Fragment key={item.label}>
                    <li>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-primary block flex items-center justify-between text-left text-xl transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label} <ChevronRight size={28} />
                        </Link>
                      ) : item.children ? (
                        <button
                          onClick={() => handleSubmenuClick(item.children!)}
                          className="hover:text-primary flex w-full items-center justify-between text-left text-xl transition-colors"
                        >
                          {item.label} <ChevronRight size={28} />
                        </button>
                      ) : null}
                    </li>
                    {index < currentMenu.length - 1 && (
                      <hr className="my-2 border-gray-200 opacity-50 dark:border-gray-700" />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

// Panel variants for mobile menu
const getPanelVariants = () => ({
  enter: { x: '100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
});

export default Navbar;
