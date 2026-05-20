import { notFound } from 'next/navigation';
import { getProductsByCategory } from '@/services/products';
import CategoryPageContent from '@/features/menu/components/CategoryPageContent';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 30;

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const { category, products } = await getProductsByCategory(slug);

    if (!category) {
        notFound();
    }

    return <CategoryPageContent slug={slug} initialCategory={category} initialProducts={products} />
}
