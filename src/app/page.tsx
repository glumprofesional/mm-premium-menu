import { getCategories } from '@/services/categories';
import HomeWithIntro from '@/components/HomeWithIntro';

export const revalidate = 30;

export default async function HomePage() {
  const categories = await getCategories();

  return <HomeWithIntro categories={categories} />;
}