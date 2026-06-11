'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchProducts, type SearchResult } from '@/app/actions/search';
import ProductModal from '@/features/menu/components/ProductModal';
import type { Product } from '@/types/product';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchProducts(value);
      setResults(data);
      setIsSearching(false);
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    setSelectedProduct({
      id: result.id,
      category_id: result.category_id,
      name: result.name,
      slug: result.slug,
      description: result.description,
      price: result.price ?? 0,
      image_url: result.image_url,
      family: null,
      is_available: result.is_available,
      sort_order: 0,
    });
    setSelectedCategorySlug(result.category_slug);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedCategorySlug('');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  if (!isOpen) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--color-bg)',
        opacity: 0.97,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search bar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '448px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Buscar bebidas, tragos, productos..."
            className="font-interface"
            style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'var(--color-text-primary)',
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'var(--font-interface)',
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxWidth: '448px',
          margin: '0 auto',
          width: '100%',
          padding: '16px 24px',
        }}
      >
        {query.trim().length < 2 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3, marginBottom: '12px' }}>
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-interface" style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
              Escribí al menos 2 letras para buscar
            </p>
          </div>
        )}

        {isSearching && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="gold-line" style={{ width: '60px', margin: '0 auto 16px auto' }} />
            <p className="font-interface" style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: 0 }}>
              Buscando...
            </p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'var(--color-surface)',
                  border: '2px solid rgba(218, 90, 71, 0.35)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(218, 90, 71, 0.6)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(218, 90, 71, 0.35)'; }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: '1px solid rgba(218, 90, 71, 0.2)',
                    overflow: 'hidden',
                  }}
                >
                  {result.image_url ? (
                    <img src={result.image_url} alt={result.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="font-heading" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {result.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    className="font-heading"
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {result.name}
                  </p>
                  <p
                    className="font-interface"
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '2px 0 0 0',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {result.category_name}
                  </p>
                </div>

                {/* Price */}
                <div style={{ flexShrink: 0 }}>
                  {!result.is_available ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Sin stock
                    </span>
                  ) : result.price != null ? (
                    <span className="price-badge" style={{ fontSize: '14px', padding: '4px 10px' }}>
                      {formatPrice(result.price)}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}

        {!isSearching && query.trim().length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="font-heading" style={{ color: 'var(--color-text-secondary)', fontSize: '16px', margin: '0 0 4px 0' }}>
              Sin resultados
            </p>
            <p className="font-interface" style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: 0 }}>
              Probá con otro nombre
            </p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        categorySlug={selectedCategorySlug}
        isOpen={!!selectedProduct}
        onClose={handleCloseModal}
        zIndex={250}
      />
    </div>
  );
}