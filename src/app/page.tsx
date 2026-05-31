import { publicDb } from '@/lib/supabase/public';
import type { Category } from '@/types/category';
import HomeWithIntro from '@/components/HomeWithIntro';
import BackToAdminButton from '@/components/BackToAdminButton';

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

  return <><HomeWithIntro categories={(categories as Category[]) || []} /><BackToAdminButton /></>;
}