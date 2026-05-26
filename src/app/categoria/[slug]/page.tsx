import { publicDb } from '@/lib/supabase/public';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import CategoryPageContent from '@/features/menu/components/CategoryPageContent';

export const revalidate = 30;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: category, error: catError } = await publicDb
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (catError) {
    console.error('Error fetching category:', catError.message);
  }

  if (!category) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1128' }}>
        <p className="font-heading" style={{ color: '#5B6D8A', fontSize: '16px' }}>
          Categoría no encontrada
        </p>
      </div>
    );
  }

  const { data: products, error: prodError } = await publicDb
    .from('products')
    .select('*')
    .eq('category_id', (category as Category).id)
    .order('name');

  if (prodError) {
    console.error('Error fetching products:', prodError.message);
  }

  const initialCategory = {
    name: (category as Category).name,
    slug: (category as Category).slug,
  };

  return (
    <CategoryPageContent
      slug={slug}
      initialCategory={initialCategory}
      initialProducts={(products as Product[]) ?? []}
    />
  );
}