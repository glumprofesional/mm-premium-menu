'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isAvailable = product.is_available !== false;

  return (
    <button
      onClick={() => onSelect(product)}
      className={`glass-card ${!isAvailable ? 'opacity-50' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        position: 'relative',
      }}
    >
      {/* Imagen o Monograma */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'rgba(212, 175, 55, 0.06)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={`Imagen de ${product.name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            className="font-heading"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-accent)',
            }}
          >
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          className="font-heading"
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '0.2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p
            className="font-interface"
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              margin: '3px 0 0 0',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.description}
          </p>
        )}
      </div>

      {/* Precio o Badge */}
      <div style={{ flexShrink: 0, marginLeft: '4px' }}>
        {!isAvailable ? (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--color-danger)',
              background: 'var(--color-stock-bg)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '6px',
              padding: '3px 8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Sin stock
          </span>
        ) : (
          <span className="price-badge">{formatPrice(product.price)}</span>
        )}
      </div>
    </button>
  );
}