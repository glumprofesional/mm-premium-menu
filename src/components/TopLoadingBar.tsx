'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopLoadingBar() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Cuando pathname cambia, la navegación terminó
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Detectar clicks en links internos automáticamente
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
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #d4af37, #d4af37)',
          width: isNavigating ? '70%' : '100%',
          transition: isNavigating ? 'width 3s ease-out' : 'width 0.15s ease-out',
        }}
      />
    </div>
  );
}