'use client';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <button 
      onClick={() => onSelect(product)}
      className={`group w-full bg-surface border border-border rounded-xl p-3 transition-transform duration-150 ease-out active:scale-[0.98] flex items-center gap-3 text-left ${!product.is_available ? 'opacity-50' : ''}`}
    >
      {/* Imagen o Placeholder */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center bg-surface-alt overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={`Imagen de ${product.name}`} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="font-heading font-bold text-2xl text-accent">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Contenido de Texto */}
      <div className="flex-grow min-w-0">
        <h3 className="font-heading font-medium text-base text-text-primary truncate">
          {product.name}
        </h3>
        {product.description && (
          <p className="font-interface text-xs text-text-secondary mt-1 truncate">
            {product.description}
          </p>
        )}
      </div>

      {/* Precio y Badge */}
      <div className="flex-shrink-0 flex flex-col items-end justify-center ml-2 pr-2">
        {!product.is_available ? (
           <span className="px-2 py-1 text-xs font-bold text-white bg-danger rounded-full">
             No disponible
           </span>
        ) : (
          <p className="font-heading font-bold text-lg text-accent whitespace-nowrap">
            {formatPrice(product.price)}
          </p>
        )}
      </div>
    </button>
  );
}
