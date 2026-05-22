'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const INTRO_KEY = 'mm-intro-shown';

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'line' | 'fadeOut'>('logo');

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_KEY)) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setPhase('line'), 800);
    const t3 = setTimeout(() => setPhase('fadeOut'), 1100);
    const t4 = setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, 'true');
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const getLetterSpacing = () => {
    if (phase === 'text') return '6px';
    if (phase === 'line' || phase === 'fadeOut') return '8px';
    return '3px';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A1128',
        transition: 'opacity 0.4s ease-out',
        opacity: phase === 'fadeOut' ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div
        style={{
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          opacity: phase === 'logo' ? 0 : 1,
          transform: phase === 'logo' ? 'scale(0.8)' : 'scale(1)',
          width: '140px',
          height: '140px',
          position: 'relative',
        }}
      >
        <Image
          src="/images/logo.png"
          alt="M&M Multiespacio"
          fill
          priority
          sizes="140px"
        />
      </div>

      {/* M&M text */}
      <h1
        className="font-heading"
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#d4af37',
          margin: '16px 0 0 0',
          letterSpacing: '4px',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
          opacity: phase === 'logo' ? 0 : 1,
          transform: phase === 'logo' ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        M&M
      </h1>

      {/* MULTIESPACIO text */}
      <p
        className="font-interface"
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#8892a4',
          letterSpacing: getLetterSpacing(),
          textTransform: 'uppercase',
          margin: '6px 0 0 0',
          transition: 'opacity 0.4s ease-out, letter-spacing 0.6s ease-out',
          opacity: phase === 'logo' ? 0 : 1,
        }}
      >
        MULTIESPACIO
      </p>

      {/* Gold line */}
      <div
        style={{
          width: phase === 'line' || phase === 'fadeOut' ? '120px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          marginTop: '20px',
          transition: 'width 0.5s ease-out',
        }}
      />
    </div>
  );
}