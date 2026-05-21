'use client';

import { useState, useEffect, useRef } from 'react';
import type { Product } from '@/types/product';

// ==========================================================================
// ICONOS
// ==========================================================================

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CupIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
    <path d="M8 3L4 7h16l-4-4H8z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7H6a1 1 0 00-1 1v6c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V8a1 1 0 00-1-1z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 21h4M12 17v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ==========================================================================
// MODAL
// ==========================================================================

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

  /* ---- Mount animation ---- */
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

  /* ---- Escape key ---- */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /* ---- Focus trap ---- */
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

  /* ---- Swipe down to close ---- */
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

  /* ---- Format price ---- */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  if (!isMounted || !product) return null;

  const isAvailable = product.is_available !== false;

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(10, 17, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
        className="glass-modal animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '384px',
          transition: 'all 200ms',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          overscrollBehaviorY: 'contain',
          touchAction: 'pan-y',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Swipe indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px 0' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(192, 192, 192, 0.3)',
            }}
          />
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'var(--color-text-secondary)',
              background: 'rgba(16, 25, 53, 0.6)',
              border: '1px solid rgba(192, 192, 192, 0.2)',
              cursor: 'pointer',
              transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.2)';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Image */}
        <div style={{ padding: '0 24px 16px 24px' }}>
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--color-surface-alt)',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isAvailable ? 1 : 0.4,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CupIcon />
              </div>
            )}
            {!isAvailable && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10, 17, 40, 0.5)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="font-interface"
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'var(--color-danger)',
                  }}
                >
                  Sin stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <h2
            id="product-modal-title"
            className="font-heading"
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
              lineHeight: 1.25,
              letterSpacing: '0.3px',
            }}
          >
            {product.name}
          </h2>

          {/* Gold separator */}
          <div className="gold-line-left" style={{ margin: '12px 0' }} />

          {product.description && (
            <p
              className="font-interface"
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                margin: '0 0 20px 0',
              }}
            >
              {product.description}
            </p>
          )}

          {/* Price / Stock badge */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {isAvailable ? (
              <span className="price-badge" style={{ fontSize: '16px', padding: '8px 18px' }}>
                {formatPrice(product.price)}
              </span>
            ) : (
              <span
                className="font-interface"
                style={{
                  display: 'inline-block',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--color-danger)',
                  background: 'var(--color-stock-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 18px',
                }}
              >
                Sin stock
              </span>
            )}
          </div>

          {/* Back button — pill style */}
          <button
            onClick={onClose}
            className="pill-button"
            style={{ width: '100%', height: '48px' }}
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}