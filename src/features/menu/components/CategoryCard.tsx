'use client';

import Link from 'next/link';
import type { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const monogram = category.name.charAt(0).toUpperCase();
  const hasBanner = !!category.banner_url;
  const hasImage = !!category.image_url;

  if (hasBanner) {
    return (
      <Link
        href={`/categoria/${category.slug}`}
        prefetch={true}
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            minHeight: '130px',
            cursor: 'pointer',
            border: '1.5px solid rgba(218, 90, 71, 0.3)',
          }}
        >
          {/* Banner de fondo */}
          <img
            src={category.banner_url!}
            alt={`Banner de ${category.name}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />

          {/* Gradiente oscuro desde abajo */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10, 17, 40, 0.82) 0%, rgba(10, 17, 40, 0.4) 40%, rgba(10, 17, 40, 0.05) 70%, transparent 100%)',
              zIndex: 1,
            }}
          />

          {/* Textura de ruido sutil */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              opacity: 0.04,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
              backgroundSize: '128px 128px',
              pointerEvents: 'none',
            }}
          />

          {/* Contenido */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Miniatura o monogram */}
            {hasImage ? (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(218, 90, 71, 0.5)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={category.image_url!}
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(218, 90, 71, 0.12)',
                  border: '1.5px solid rgba(218, 90, 71, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#da5a47',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                {monogram}
              </div>
            )}

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                className="font-heading"
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: '0.3px',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}
              >
                {category.name}
              </h3>
              {category.description && (
                <p
                  className="font-interface"
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    margin: '2px 0 0 0',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                >
                  {category.description}
                </p>
              )}
            </div>

            {/* Chevron */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(218, 90, 71, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  // Si NO tiene banner, mostrar estilo clásico
  return (
    <Link
      href={`/categoria/${category.slug}`}
      prefetch={true}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
        }}
      >
        {hasImage ? (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1.5px solid rgba(218, 90, 71, 0.5)',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(218, 90, 71, 0.08)',
            }}
          >
            <img
              src={category.image_url!}
              alt={`Imagen de ${category.name}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="monogram">{monogram}</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="font-heading"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: '0.3px',
            }}
          >
            {category.name}
          </h3>
          {category.description && (
            <p
              className="font-interface"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                margin: '4px 0 0 0',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {category.description}
            </p>
          )}
        </div>

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
      </div>
    </Link>
  );
}
