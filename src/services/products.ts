import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types/product';

interface CategoryProductsResult {
  category: { name: string; slug: string } | null;
  products: Product[];
}

export async function getProductsByCategory(slug: string): Promise<CategoryProductsResult> {
  const supabase = await createClient();

  // 1. Fetch the category by slug
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (categoryError || !categoryData) {
    return { category: null, products: [] };
  }

  // 2. Fetch products for the found category
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryData.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (productsError) {
    return { category: { name: categoryData.name, slug: categoryData.slug }, products: [] };
  }

  return { 
    category: { name: categoryData.name, slug: categoryData.slug }, 
    products: productsData || [] 
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}
