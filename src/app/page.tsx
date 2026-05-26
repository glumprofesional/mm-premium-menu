import { publicDb } from '@/lib/supabase/public';
import type { Category } from '@/types/category';
import Header from '@/components/layout/Header';
import CategoryCard from '@/features/menu/components/CategoryCard';

export const revalidate = 30;

export default async function HomePage() {
  const { data: categories, error } = await publicDb
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error.message);
  }

  return (
    <>
      <Header variant="home" />
      <div style={{ maxWidth: '448px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '32px', paddingBottom: '96px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: 700, color: '#F4F7F9', margin: '0 0 8px 0', lineHeight: 1.2, letterSpacing: '0.5px' }}>
            Nuestro Menú
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6D8A', margin: 0, lineHeight: 1.6 }}>
            Descubrí nuestra selección premium
          </p>
        </div>
        <div className="gold-line-left" style={{ marginBottom: '28px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categories && categories.length > 0 ? (
            categories.map((category: Category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p className="font-heading" style={{ fontSize: '16px', color: '#5B6D8A', margin: 0 }}>
                Menú no disponible
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}