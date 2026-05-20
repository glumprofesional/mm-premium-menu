'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CupIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 3L4 7h16l-4-4H8z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7H6a1 1 0 00-1 1v6c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V8a1 1 0 00-1-1z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 21h4M12 17v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface ProductModalProps {
  product: Product | null;
  categorySlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, categorySlug, isOpen, onClose }: ProductModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.touches[0].clientY - touchStart;
    if (diff > 120) {
      onClose();
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  if (!isMounted || !product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 90%, transparent)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full max-w-sm bg-surface rounded-2xl shadow-2xl transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ overscrollBehaviorY: 'contain', touchAction: 'pan-y' }}
      >
        {/* Botón cerrar */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Imagen */}
        <div className="px-6 pb-4">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-surface-alt">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent">
                <CupIcon />
              </div>
            )}
            {!product.is_available && <div className="absolute inset-0 bg-black/40" />}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pb-6">
          <h2 id="product-modal-title" className="font-heading font-bold text-2xl text-text-primary mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="font-interface text-sm text-text-secondary leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Precio / Sin stock */}
          <div className="text-center mb-6">
            {product.is_available ? (
              <span className="inline-block bg-accent text-on-accent font-heading font-bold text-xl px-6 py-3 rounded-xl">
                {formatPrice(product.price)}
              </span>
            ) : (
              <span className="inline-block bg-stock-bg text-stock-text font-interface font-medium text-sm px-6 py-3 rounded-xl">
                Sin stock
              </span>
            )}
          </div>

          {/* Botón volver */}
          <button
            onClick={() => {
              onClose();
              router.push(`/categoria/${categorySlug}`);
            }}
            className="w-full h-12 flex items-center justify-center border border-border rounded-xl text-sm font-interface font-medium text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}