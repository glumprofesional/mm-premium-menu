'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const isAvailable = product.is_available !== false;
  const accent = '#da5a47';

  /* Chevron con círculo frosted glass — igual que CategoryCard */
  const ChevronCircle = () => (
    <div
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(24, 24, 32, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(218, 90, 71, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  return (
    <button
      onClick={() => onSelect(product)}
      className={`glass-card ${!isAvailable ? 'unavailable-overlay' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '14px',
        gap: '10px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        border: '1px solid rgba(218, 90, 71, 0.15)',
        outline: 'none',
        background: 'linear-gradient(to right, #1E1E2E 75%, #181820 100%)',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      {product.image_url ? (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--color-surface-alt)',
          }}
        >
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--color-surface-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5">
            <path d="M8 3L4 7h16l-4-4H8z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 7H6a1 1 0 00-1 1v6c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V8a1 1 0 00-1-1z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3
          className="font-heading"
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '0.2px',
            paddingRight: '8px',
          }}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        )}

        {product.price != null && isAvailable && (
          <div style={{ marginTop: '2px' }}>
            <span className="price-badge">
              ${product.price.toLocaleString('es-AR')}
            </span>
          </div>
        )}
      </div>

      <ChevronCircle />
    </button>
  );
}