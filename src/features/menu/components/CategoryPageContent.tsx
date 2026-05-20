'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

const ArrowLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface CategoryPageContentProps {
  slug: string;
  initialCategory: { name: string; slug: string };
  initialProducts: Product[];
}

export default function CategoryPageContent({ slug, initialCategory, initialProducts }: CategoryPageContentProps) {
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-base">
      <header className="sticky top-0 bg-base/80 backdrop-blur-lg z-10 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeftIcon />
                    <span className="font-interface text-sm font-medium">Menú</span>
                </button>
                <div className="flex items-center gap-4">
                    <h1 className="font-heading text-lg font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{category.name}</h1>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
          ))}
        </div>
      </main>

      <ProductModal 
        product={selectedProduct} 
        categorySlug={slug}
        isOpen={!!selectedProduct}
        onClose={handleCloseModal}
      />
    </div>
  );
}
