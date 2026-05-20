import { getCategories } from '@/services/categories';
import Header from '@/components/layout/Header';
import CategoryCard from '@/features/menu/components/CategoryCard';

export const revalidate = 30;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <Header variant="home" />
      <div className="w-full max-w-md mx-auto px-5 pt-6 pb-24">
        <header className="text-center mb-8">
          <h1 className="font-heading font-bold text-sm text-text-secondary uppercase tracking-[3px]">
            Nuestro Menú
          </h1>
        </header>

        {categories.length > 0 ? (
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-muted">Menú no disponible</p>
            <p className="text-sm text-text-muted mt-2">Por favor, intente de nuevo más tarde.</p>
          </div>
        )}
      </div>
    </>
  );
}