'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Reset transition state on initial load
    document.documentElement.classList.remove('page-transition');

    // Skip transition on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // Only apply view transitions if browser supports it
    if (document.startViewTransition) {
      // Remove transition class first to reset animations
      document.documentElement.classList.remove('page-transition');

      // Force browser to recalculate styles before adding the class back
      window.requestAnimationFrame(() => {
        document.documentElement.classList.add('page-transition');

        document.startViewTransition(() => {
          // The transition is already happening through Next.js router
          return Promise.resolve();
        });
      });
    }
  }, [pathname]); // Re-run effect when the route changes

  return <>{children}</>;
}
