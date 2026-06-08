'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopLoadingBar() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('/') && href !== pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '2px',
        overflow: 'hidden',
        opacity: isNavigating ? 1 : 0,
        transition: 'opacity 0.15s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #da5a47, #da5a47, transparent)',
          backgroundSize: '200% 100%',
          width: isNavigating ? '80%' : '100%',
          transition: isNavigating
            ? 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'width 0.1s ease-out',
          animation: isNavigating ? 'loadingShimmer 1s ease infinite' : 'none',
        }}
      />
    </div>
  );
}