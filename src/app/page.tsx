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
        {/* Welcome */}
        <div style={{ marginBottom: '36px' }}>
          <h1
            className="font-heading"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#F4F7F9',
              margin: '0 0 8px 0',
              lineHeight: 1.2,
              letterSpacing: '0.5px',
            }}
          >
            Nuestro Menú
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#5B6D8A',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Descubrí nuestra selección premium
          </p>
        </div>

        {/* Gold separator */}
        <div className="gold-line-left" style={{ marginBottom: '28px' }} />

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
              style={{ color: '#5B6D8A', fontSize: '16px', margin: '0 0 8px 0' }}
            >
              Menú no disponible
            </p>
            <p style={{ color: '#3d4f6a', fontSize: '14px', margin: 0 }}>
              Por favor, intente de nuevo más tarde.
            </p>
          </div>
        )}
      </div>
    </>
  );
}