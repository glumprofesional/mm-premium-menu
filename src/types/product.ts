export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  family: string | null;
  is_available: boolean;
  sort_order: number;
}