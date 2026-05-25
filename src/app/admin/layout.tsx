import { createClient } from '@/lib/supabase/server'
import { adminDb } from '@/lib/supabase/admin'
import { signOut } from './actions'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: allowedUser } = await adminDb
    .from('allowed_users')
    .select('email, role')
    .eq('email', user.email)
    .single()

  if (!allowedUser) {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh bg-[var(--admin-bg)] transition-colors duration-300">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[var(--admin-bg)] border-b border-[var(--admin-border)] transition-colors duration-300">
        <div className="max-w-[960px] mx-auto px-6 h-16 flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="M&M Multiespacio"
            width={40}
            height={40}
            className="rounded-full"
          />

          <span className="text-xs text-[var(--admin-text-secondary)] font-medium uppercase tracking-widest transition-colors duration-300">
            Admin
          </span>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold text-[var(--admin-text-secondary)] px-4 py-2 rounded-full border border-[var(--admin-border)] hover:border-[rgba(212,175,55,0.3)] hover:text-[#d4af37] transition-colors"
            >
              Ver Carta
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs font-semibold text-red-400 px-4 py-2 rounded-full border border-[rgba(239,68,68,0.25)] hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <div className="gold-line" />
      </header>

      {/* Content */}
      {children}
    </div>
  )
}