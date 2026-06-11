'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const isAvailable = product.is_available !== false;
  const accent = '#a31830';

  const ChevronCircle = () => (
    <div
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
      className={!isAvailable ? 'unavailable-overlay' : ''}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px',
        gap: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderRadius: '20px',
        boxShadow:
          'rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.3) 0px 24px 48px -12px',
        textDecoration: 'none',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow =
          'rgba(255, 255, 255, 0.25) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.4) 0px 28px 56px -12px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow =
          'rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.3) 0px 24px 48px -12px';
      }}
    >
      {/* Thumbnail */}
      {product.image_url ? (
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'transparent',
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
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'transparent',
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
