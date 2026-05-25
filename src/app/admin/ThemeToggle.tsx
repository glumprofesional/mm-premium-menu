'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(prefersDark)
    applyTheme(prefersDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)

    if (dark) {
      root.style.setProperty('--admin-bg', '#0A1128')
      root.style.setProperty('--admin-surface', 'rgba(255,255,255,0.05)')
      root.style.setProperty('--admin-surface-hover', 'rgba(255,255,255,0.08)')
      root.style.setProperty('--admin-text', '#ffffff')
      root.style.setProperty('--admin-text-secondary', '#9ca3af')
      root.style.setProperty('--admin-border', 'rgba(212,175,55,0.12)')
    } else {
      root.style.setProperty('--admin-bg', '#f0f2f5')
      root.style.setProperty('--admin-surface', 'rgba(0,0,0,0.04)')
      root.style.setProperty('--admin-surface-hover', 'rgba(0,0,0,0.08)')
      root.style.setProperty('--admin-text', '#1a1a2e')
      root.style.setProperty('--admin-text-secondary', '#6b7280')
      root.style.setProperty('--admin-border', 'rgba(212,175,55,0.2)')
    }
  }

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    applyTheme(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="p-2 rounded-lg text-gray-400 hover:text-[#d4af37] hover:bg-[rgba(212,175,55,0.1)] transition-colors cursor-pointer"
    >
      {isDark ? (
        <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}