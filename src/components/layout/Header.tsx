'use client';

import { useState } from 'react';
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
            justifyContent: 'space-between',
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
            <div style={{ width: '36px' }} /> /* Espaciador para centrar el logo */
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

          {/* Derecha — Lupa de búsqueda (home) o espaciador (category) */}
          {variant === 'home' ? (
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
          ) : (
            <div style={{ width: '36px' }} /> /* Espaciador para centrar el título */
          )}
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