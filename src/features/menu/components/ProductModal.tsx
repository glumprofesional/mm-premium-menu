'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { getOptimizedImageUrl } from '@/lib/utils/image';

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

interface ProductModalProps {
  product: Product | null;
  categorySlug: string;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

export default function ProductModal({ product, categorySlug, isOpen, onClose, zIndex }: ProductModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price);

  if (!isMounted || !product) return null;

  const isAvailable = product.is_available !== false;
  const modalImageUrl = getOptimizedImageUrl(product.image_url, { width: 400, quality: 85 });

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex ?? 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundImage: 'url(/images/modal-bg.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(26, 26, 26, 0.85)',
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
        className="animate-slide-up"
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
          background: 'linear-gradient(43deg, #4a4a4f 0%, #303035 46%, #1e1e22 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(163, 24, 48, 0.4)',
          boxShadow:
            'rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px',
        }}
      >
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
              color: 'var(--color-accent)',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(163, 24, 48, 0.8)';
              e.currentTarget.style.background = 'rgba(163, 24, 48, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: '0 24px 16px 24px' }}>
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              width: '100%',
              borderRadius: '12px',
              border: '1px solid rgba(209, 207, 185, 0.5)',
              overflow: 'hidden',
              background: '#1a1a1a',
            }}
          >
            {modalImageUrl ? (
              <Image
                src={modalImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 384px) 100vw, 384px"
                style={{ objectFit: 'cover', opacity: isAvailable ? 1 : 0.4 }}
                priority
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
                  background: 'rgba(26, 26, 26, 0.5)',
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
              textAlign: 'center',
            }}
          >
            {product.name}
          </h2>

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

          <button
            onClick={onClose}
            className="pill-button"
            style={{ width: '100%', height: '48px', borderWidth: '2px' }}
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}