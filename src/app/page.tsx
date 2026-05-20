import { getCategories } from '@/services/categories';
import CategoryCard from '@/features/menu/components/CategoryCard';

// Habilitamos ISR (Incremental Static Regeneration) con un revalidate de 30 segundos
export const revalidate = 30;

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-6 pb-20">
      
      <header className="text-center mb-8">
        <h1 className="font-heading font-bold text-sm text-[var(--text-secondary)] uppercase tracking-[3px]">
          Nuestro Menú
        </h1>
      </header>

      {
        categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)]">Menú no disponible</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">Por favor, intente de nuevo más tarde.</p>
          </div>
        )
      }
    </div>
  );
}
