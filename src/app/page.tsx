import { getCategories } from '@/services/categories';
import Header from '@/components/layout/Header';
import CategoryCard from '@/features/menu/components/CategoryCard';

export const revalidate = 30;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <Header variant="home" />
      <div style={{ maxWidth: '448px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '32px', paddingBottom: '96px' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="font-heading font-bold text-sm text-text-secondary uppercase" style={{ letterSpacing: '3px' }}>
            Nuestro Menú
          </h1>
        </header>

        {categories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p className="text-text-muted">Menú no disponible</p>
            <p className="text-text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>Por favor, intente de nuevo más tarde.</p>
          </div>
        )}
      </div>
    </>
  );
}