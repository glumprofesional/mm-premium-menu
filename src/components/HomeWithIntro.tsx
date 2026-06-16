'use client';

import { useState, useCallback } from 'react';
import type { Category } from '@/types/category';
import IntroAnimation from './IntroAnimation';
import Header from './layout/Header';
import CategoryCard from '@/features/menu/components/CategoryCard';

// ==========================================================================
// INFO BANNER — Bordes verdes, texto blanco, ícono verde con ! blanco
// ==========================================================================

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 2L1 21h22L12 2z" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    <path d="M12 9v5" stroke="var(--color-text-primary)" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.2" fill="var(--color-text-primary)"/>
  </svg>
);

function InfoBanner({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        background: 'rgba(34, 197, 94, 0.06)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
      }}
    >
      <WarningIcon />
      <p
        className="font-interface"
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.4,
          letterSpacing: '0.3px',
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ==========================================================================
// HOME WITH INTRO
// ==========================================================================

interface HomeWithIntroProps {
  categories: Category[];
}

export default function HomeWithIntro({ categories }: HomeWithIntroProps) {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      <Header variant="home" />

      <div
        style={{
          maxWidth: '448px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '32px',
          paddingBottom: '96px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            className="font-heading"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
              lineHeight: 1.2,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Carta Exclusiva
          </h1>
        </div>

        <div className="gold-line" style={{ marginBottom: '28px' }} />

        {categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p
              className="font-heading"
              style={{ color: 'var(--color-text-secondary)', fontSize: '16px', margin: '0 0 8px 0' }}
            >
              Menú no disponible
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
              Por favor, intente de nuevo más tarde.
            </p>
          </div>
        )}

        {/* Info banners */}
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <InfoBanner text="Barra habilitada hasta las 4 a.m." />
          <InfoBanner text="10% de recargo pagando con transferencia o tarjeta" />
        </div>
      </div>
    </>
  );
}