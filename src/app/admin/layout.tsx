import { createClient } from '@/lib/supabase/server'
import { adminDb } from '@/lib/supabase/admin'
import { signOut } from './actions'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario, solo renderizar children (página de login)
  if (!user) {
    return <>{children}</>
  }

  // Verificar si está autorizado (usar adminDb para bypass RLS)
  const { data: allowedUser } = await adminDb
    .from('allowed_users')
    .select('email, role')
    .eq('email', user.email)
    .single()

  if (!allowedUser) {
    return <>{children}</>
  }

  return (
    <div className="min-h-dvh bg-[#0A1128]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[#0A1128] border-b border-[rgba(212,175,55,0.12)]">
        <div className="max-w-[960px] mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <span className="text-xl font-bold text-[#d4af37] tracking-wider">
            M&amp;M
          </span>

          <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
            Admin
          </span>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-400 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] hover:border-[rgba(212,175,55,0.3)] hover:text-[#d4af37] transition-colors"
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