'use server';

import { publicDb } from '@/lib/supabase/public';

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
  category_name: string;
  category_slug: string;
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = publicDb;
  const term = query.trim();

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, image_url, is_available, category_id, categories!inner(name, slug)')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(20);

  if (error || !data) return [];

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    is_available: item.is_available,
    category_id: item.category_id,
    category_name: item.categories?.name || '',
    category_slug: item.categories?.slug || '',
  }));
}