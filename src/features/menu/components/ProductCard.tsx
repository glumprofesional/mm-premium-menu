'use client';

import type { Product } from '@/lib/types';

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
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px',
        gap: '10px',
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
      {/* Product Name - with white background */}
      <h3
        className="font-heading"
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0A1128',
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: '0.2px',
          paddingRight: '8px',
          background: 'rgba(255, 255, 255, 0.93)',
          padding: '3px 8px',
          borderRadius: '6px',
          display: 'inline-block',
          maxWidth: '100%',
        }}
      >
        {product.name}
      </h3>

      {/* Description */}
      {product.description && (
        <p
          style={{
            fontSize: '13px',
            color: '#5B6D8A',
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

      {/* Price Badge */}
      {product.price != null && isAvailable && (
        <div style={{ marginTop: '2px' }}>
          <span className="price-badge">
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>
      )}
    </button>
  );
}
