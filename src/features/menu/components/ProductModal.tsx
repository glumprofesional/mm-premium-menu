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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
        backdropFilter: 'blur(8px)',
        transition: 'opacity 200ms',
        opacity: isOpen ? 1 : 0,
      }}
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
        style={{
          width: '100%',
          maxWidth: '384px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          transition: 'all 200ms',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          overscrollBehaviorY: 'contain',
          touchAction: 'pan-y',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Botón cerrar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0 16px' }}>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Imagen */}
        <div style={{ padding: '0 24px 16px 24px' }}>
          <div style={{
            position: 'relative',
            aspectRatio: '4/3',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'var(--color-surface-alt)',
          }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <CupIcon />
              </div>
            )}
            {!product.is_available && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <h2 id="product-modal-title" className="font-heading font-bold text-2xl text-text-primary" style={{ marginBottom: '8px' }}>
            {product.name}
          </h2>
          {product.description && (
            <p className="font-interface text-sm text-text-secondary" style={{ lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>
          )}

          {/* Precio / Sin stock */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {product.is_available ? (
              <span style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-on-accent)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '20px',
                padding: '12px 24px',
                borderRadius: '12px',
              }}>
                {formatPrice(product.price)}
              </span>
            ) : (
              <span style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-stock-bg)',
                color: 'var(--color-stock-text)',
                fontFamily: 'var(--font-interface)',
                fontWeight: 500,
                fontSize: '14px',
                padding: '12px 24px',
                borderRadius: '12px',
              }}>
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
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font-interface)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}