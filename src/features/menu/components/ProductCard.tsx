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
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
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
        background: 'linear-gradient(43deg, #2d1a1e 0%, #1f1215 46%, #1a1a1a 100%)',
        borderRadius: '16px',
        boxShadow:
          'rgba(0, 0, 0, 0.2) 0px -6px 10px 0px inset, rgba(0, 0, 0, 0.15) 0px -10px 8px 0px inset, rgba(0, 0, 0, 0.1) 0px -20px 12px 0px inset, rgba(0, 0, 0, 0.06) 0px 1px 1px, rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px',
        textDecoration: 'none',
        position: 'relative',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow =
          'rgba(0, 0, 0, 0.25) 0px -8px 14px 0px inset, rgba(0, 0, 0, 0.2) 0px -14px 12px 0px inset, rgba(0, 0, 0, 0.12) 0px -28px 16px 0px inset, rgba(0, 0, 0, 0.06) 0px 1px 1px, rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow =
          'rgba(0, 0, 0, 0.2) 0px -6px 10px 0px inset, rgba(0, 0, 0, 0.15) 0px -10px 8px 0px inset, rgba(0, 0, 0, 0.1) 0px -20px 12px 0px inset, rgba(0, 0, 0, 0.06) 0px 1px 1px, rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px';
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