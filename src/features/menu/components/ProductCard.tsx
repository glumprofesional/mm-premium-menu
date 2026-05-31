'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const isAvailable = product.is_available !== false;

  return (
    <button
      onClick={() => onSelect(product)}
      className={`glass-card ${!isAvailable ? 'unavailable-overlay' : ''}`}
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
        background: 'transparent',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
              fontSize: '13px',
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

      {/* Chevron — color naranja, respeta ambos modos */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.7 }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}