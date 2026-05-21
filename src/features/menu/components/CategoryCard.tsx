import Link from 'next/link';
import type { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const monogram = category.name.charAt(0).toUpperCase();

  return (
    <Link href={`/categoria/${category.slug}`} className="block no-underline" style={{ textDecoration: 'none' }}>
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
        {/* Monogram o Imagen */}
        {category.image_url ? (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(212, 175, 55, 0.08)',
            }}
          >
            <img
              src={category.image_url}
              alt={`Imagen de ${category.name}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="monogram">{monogram}</div>
        )}

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
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
          </h3>
          {category.description && (
            <p
              className="font-interface"
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

        {/* Gold chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4af37"
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