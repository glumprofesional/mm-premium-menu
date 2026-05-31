'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const INTRO_KEY = 'mm-intro-shown';

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'hidden' | 'logo' | 'text' | 'line' | 'fadeOut'>('hidden');

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_KEY)) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase('logo'), 50);
    const t2 = setTimeout(() => setPhase('text'), 700);
    const t3 = setTimeout(() => setPhase('line'), 1400);
    const t4 = setTimeout(() => setPhase('fadeOut'), 2200);
    const t5 = setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, 'true');
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const getLetterSpacing = () => {
    if (phase === 'text') return '6px';
    if (phase === 'line' || phase === 'fadeOut') return '8px';
    return '3px';
  };

  const getLogoScale = () => {
    if (phase === 'hidden') return 'scale(0)';
    if (phase === 'logo') return 'scale(1.08)';
    return 'scale(1)';
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
        transition: 'opacity 0.8s ease-out',
        opacity: phase === 'fadeOut' ? 0 : 1,
      }}
    >
      <div
        style={{
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: getLogoScale(),
          width: '150px',
          height: '150px',
          position: 'relative',
        }}
      >
        <Image
          src="/images/logo.png"
          alt="M&M Multiespacio"
          fill
          priority
          sizes="150px"
        />
      </div>

      <h1
        className="font-heading"
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#da5a47',
          margin: '20px 0 0 0',
          letterSpacing: '4px',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          opacity: phase === 'hidden' ? 0 : phase === 'logo' ? 0 : 1,
          transform: phase === 'text' || phase === 'line' || phase === 'fadeOut' ? 'translateY(0)' : 'translateY(15px)',
        }}
      >
        M&M
      </h1>

      <p
        className="font-interface"
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#8892a4',
          letterSpacing: getLetterSpacing(),
          textTransform: 'uppercase',
          margin: '8px 0 0 0',
          transition: 'opacity 0.5s ease-out, letter-spacing 0.6s ease-out',
          opacity: phase === 'line' || phase === 'fadeOut' ? 1 : 0,
        }}
      >
        MULTIESPACIO
      </p>

      <div
        style={{
          width: phase === 'line' || phase === 'fadeOut' ? '120px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #da5a47, transparent)',
          marginTop: '24px',
          transition: 'width 0.6s ease-out',
        }}
      />
    </div>
  );
}