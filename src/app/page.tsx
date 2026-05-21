import { getCategories } from '@/services/categories';
import Header from '@/components/layout/Header';
import CategoryCard from '@/features/menu/components/CategoryCard';

export const revalidate = 30;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
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
        {/* Welcome — centrado */}
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
          <p
            className="font-interface"
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.6,
              letterSpacing: '0.5px',
            }}
          >
            Selección premium de bebidas y experiencias
          </p>
        </div>

        {/* Gold separator */}
        <div className="gold-line" style={{ marginBottom: '28px' }} />

        {/* Categories */}
        {categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
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
      </div>
    </>
  );
}