import Link from 'next/link';
import type { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const monogram = category.name.charAt(0).toUpperCase();
  const hasBanner = !!category.banner_url;
  const accent = '#da5a47';

  /* ─── Banner Card (with background image) ─── */
  if (hasBanner) {
    return (
      <Link href={`/categoria/${category.slug}`} className="block no-underline">
        <div
          style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2.5px solid rgba(218, 90, 71, 0.3)',
            minHeight: '120px',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(218,90,71,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
          }}
        >
          {/* Background image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${category.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Dark overlay with noise gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10,17,40,0.82) 0%, rgba(10,17,40,0.50) 40%, rgba(10,17,40,0.08) 75%, transparent 100%)',
            }}
          />

          {/* Noise texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
              pointerEvents: 'none',
            }}
          />

          {/* Content — centrado verticalmente */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 20px',
              minHeight: '120px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                className="font-heading"
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#F4F7F9',
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: '0.3px',
                }}
              >
                {category.name}
              </h2>
              {category.description && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#8899B0',
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginLeft: '12px', opacity: 0.85 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Classic Card (no banner — monogram/image fallback) ─── */
  return (
    <Link href={`/categoria/${category.slug}`} className="block no-underline">
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '2.5px solid rgba(218, 90, 71, 0.25)',
        }}
      >
        {category.image_url ? (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(218,90,71,0.4)',
              flexShrink: 0,
            }}
          >
            <img
              src={category.image_url}
              alt={category.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '2px solid rgba(218,90,71,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading), Georgia, serif',
              fontSize: '22px',
              fontWeight: 700,
              color: accent,
              background: 'rgba(218,90,71,0.08)',
              flexShrink: 0,
            }}
          >
            {monogram}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            className="font-heading"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#F4F7F9',
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: '0.3px',
            }}
          >
            {category.name}
          </h2>
          {category.description && (
            <p
              style={{
                fontSize: '13px',
                color: '#5B6D8A',
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
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, opacity: 0.85 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}