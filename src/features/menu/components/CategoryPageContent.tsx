'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

interface CategoryPageContentProps {
  slug: string;
  initialCategory: { name: string; slug: string };
  initialProducts: Product[];
}

export default function CategoryPageContent({ slug, initialCategory, initialProducts }: CategoryPageContentProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      <Header variant="category" name={initialCategory.name} />
      <div className="w-full max-w-md mx-auto px-5 pt-4 pb-24">
        {initialProducts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-muted">No hay productos disponibles en esta categoría.</p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        categorySlug={slug}
        isOpen={!!selectedProduct}
        onClose={handleCloseModal}
      />
    </>
  );
}