'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const hasBanner = !!category.banner_url;
  const accent = '#a31830';
  const monogram = category.name.charAt(0).toUpperCase();

  const InlineChevron = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginLeft: '6px' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  const ChevronCircle = () => (
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(26, 26, 26, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(163, 24, 48, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  /* ─── Banner Card ─── */
  if (hasBanner) {
    return (
      <Link href={`/categoria/${category.slug}`} prefetch={true} className="block no-underline">
        <div
          style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2.5px solid rgba(163, 24, 48, 0.3)',
            minHeight: '140px',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow =
              '0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(163,24,48,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
          }}
        >
          {/* Imagen con next/image (lazy-loading automático) */}
          <Image
            src={category.banner_url!}
            alt={category.name}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            style={{ objectFit: 'cover' }}
            priority={index < 4}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(26,26,26,0.82) 0%, rgba(26,26,26,0.50) 40%, rgba(26,26,26,0.08) 75%, transparent 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '22px 20px',
              minHeight: '140px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <h2
                className="font-heading"
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#d1cfb9',
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {category.name}
                <InlineChevron />
              </h2>
            </div>
            {category.description && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#8892a4',
                  margin: '4px 0 0 0',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Classic Card ─── */
  return (
    <Link href={`/categoria/${category.slug}`} prefetch={true} className="block no-underline">
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '2.5px solid rgba(163, 24, 48, 0.25)',
          minHeight: '110px',
        }}
      >
        {category.image_url ? (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(163, 24, 48, 0.4)',
              flexShrink: 0,
            }}
          >
            <img
              src={category.image_url}
              alt={category.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '2px solid rgba(163, 24, 48, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading), Georgia, serif',
              fontSize: '22px',
              fontWeight: 700,
              color: accent,
              background: 'rgba(163, 24, 48, 0.08)',
              flexShrink: 0,
            }}
          >
            {monogram}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            className="font-heading"
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#d1cfb9',
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: '0.3px',
            }}
          >
            {category.name}
          </h2>
          {category.description && (
            <p
              style={{
                fontSize: '13px',
                color: '#5a6478',
                margin: '4px 0 0 0',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {category.description}
            </p>
          )}
        </div>
        <ChevronCircle />
      </div>
    </Link>
  );
}