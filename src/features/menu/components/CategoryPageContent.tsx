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
      <div style={{ maxWidth: '448px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '96px' }}>
        {initialProducts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleProductClick} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
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