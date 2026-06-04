'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchOverlay from '@/components/SearchOverlay';

// ==========================================================================
// ICONOS SVG INLINE
// ==========================================================================

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79C21 17.61 17.18 21.43 12.39 21.43C10.61 21.43 8.95 20.94 7.55 20.08C4.54 18.12 3.19 14.65 4.08 11.53C4.97 8.41 7.82 5.92 11.16 5.57C14.5 5.22 17.68 6.84 19.46 9.45C20.45 10.45 21 11.59 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ==========================================================================
// THEME TOGGLE
// ==========================================================================

const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const themeIsLight = savedTheme === 'light';
    setIsLight(themeIsLight);
  }, []);

  const toggleTheme = () => {
    const newThemeIsLight = !isLight;
    setIsLight(newThemeIsLight);
    localStorage.setItem('theme', newThemeIsLight ? 'light' : 'dark');
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newThemeIsLight ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
      style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: 'var(--color-text-secondary)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

// ==========================================================================
// HEADER
// ==========================================================================

interface HeaderProps {
  variant?: 'home' | 'category';
  name?: string;
}

export default function Header({ variant = 'home', name }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '448px',
            margin: '0 auto',
            paddingLeft: '24px',
            paddingRight: '24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Izquierda */}
          {variant === 'category' ? (
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            >
              <BackArrowIcon />
              <span className="font-interface">Menú</span>
            </Link>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'var(--color-text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              <SearchIcon />
            </button>
          )}

          {/* Centro — Logo o categoría */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {variant === 'category' ? (
              <h1
                className="font-heading"
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  margin: 0,
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '60vw',
                }}
              >
                {name || 'Categoría'}
              </h1>
            ) : (
              <Link href="/" aria-label="Ir al inicio" style={{ textDecoration: 'none' }}>
                <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                  <Image
                    src="/images/logo.png"
                    alt="M&M Multiespacio"
                    fill
                    sizes="50px"
                    priority
                  />
                </div>
              </Link>
            )}
          </div>

          {/* Derecha */}
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Gold accent line */}
        <div className="gold-line" />
      </header>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}