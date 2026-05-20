'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ==========================================================================
// ICONOS SVG INLINE
// ==========================================================================

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1V3" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V23" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 4.22L5.64 5.64" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 18.36L19.78 19.78" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 12H3" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H23" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 19.78L5.64 18.36" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 5.64L19.78 4.22" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79C21 17.61 17.18 21.43 12.39 21.43C10.61 21.43 8.95 20.94 7.55 20.08C4.54 18.12 3.19 14.65 4.08 11.53C4.97 8.41 7.82 5.92 11.16 5.57C14.5 5.22 17.68 6.84 19.46 9.45C20.45 10.45 21 11.59 21 12.79Z" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Placeholder para el logo
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="var(--accent)"/>
  </svg>
);

// ==========================================================================
// SUB-COMPONENTES DEL HEADER
// ==========================================================================

const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const themeIsLight = savedTheme === 'light';
    setIsLight(themeIsLight);
    document.documentElement.classList.toggle('light', themeIsLight);
  }, []);

  const toggleTheme = () => {
    const newThemeIsLight = !isLight;
    setIsLight(newThemeIsLight);
    localStorage.setItem('theme', newThemeIsLight ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', newThemeIsLight);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="w-11 h-11 flex items-center justify-center rounded-full" 
      aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

// ==========================================================================
// COMPONENTE PRINCIPAL DEL HEADER
// ==========================================================================

interface HeaderProps {
  variant?: 'home' | 'category';
  categoryName?: string;
}

export default function Header({ variant = 'home', categoryName }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 h-[56px] w-full bg-[var(--base)]/95 border-b border-[var(--border)]">
      <div className="h-full w-full mx-auto px-4 flex items-center justify-between">

        {/* Izquierda */}
        <div className="flex items-center h-full">
          {variant === 'category' ? (
            <Link href="/" className="flex items-center h-full -ml-2">
              <div className="w-11 h-11 flex items-center justify-center">
                  <BackArrowIcon />
              </div>
              <span className="ml-1 font-heading font-bold text-[18px]">
                {categoryName || 'Volver'}
              </span>
            </Link>
          ) : (
             <button className="w-11 h-11 flex items-center justify-center rounded-full" aria-label="Buscar">
               <SearchIcon />
             </button>
          )}
        </div>

        {/* Centro (solo en home) */}
        {variant === 'home' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" aria-label="Ir al inicio">
               <Logo />
            </Link>
          </div>
        )}

        {/* Derecha */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
