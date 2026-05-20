import Link from 'next/link';
import type { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/categoria/${category.slug}`} 
      className="group block w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 transition-transform duration-150 ease-out active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        {/* Imagen o Placeholder */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg flex items-center justify-center bg-[var(--surface-alt)] overflow-hidden">
          {category.image_url ? (
            <img 
              src={category.image_url} 
              alt={`Imagen de ${category.name}`} 
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="font-heading font-bold text-3xl text-[var(--accent)]">
              {category.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Contenido de Texto */}
        <div className="flex flex-col justify-center">
          <h3 className="font-heading font-bold text-2xl text-[var(--text-primary)] leading-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="font-interface text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}