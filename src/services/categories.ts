import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }
    
    return data || [];

  } catch (error) {
    return [];
  }
}
