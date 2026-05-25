'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError('Credenciales incorrectas. Intentá de nuevo.')
        setLoading(false)
        return
      }

      if (data.user) {
        const { data: allowedUser, error: dbError } = await supabase
          .from('allowed_users')
          .select('email, role')
          .eq('email', data.user.email)
          .single()

        if (dbError || !allowedUser) {
          await supabase.auth.signOut()
          setError('No tenés autorización para acceder al panel.')
          setLoading(false)
          return
        }

        router.push('/admin')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0A1128] px-6">
      <div className="glass-modal w-full max-w-[380px] py-10 px-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-[1.5px] border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.08)] flex items-center justify-center text-[#d4af37] text-[28px] font-bold">
            M&amp;M
          </div>
          <h1 className="text-[22px] font-bold text-white mb-1.5 tracking-wide">
            Panel de Administración
          </h1>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        {/* Gold separator */}
        <div className="gold-line mb-7" />

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-[18px]">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] rounded-[10px] text-white text-[15px] placeholder-gray-500 focus:outline-none focus:border-[rgba(212,175,55,0.5)] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.12)] rounded-[10px] text-white text-[15px] placeholder-gray-500 focus:outline-none focus:border-[rgba(212,175,55,0.5)] transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="px-3.5 py-3 rounded-[10px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] mb-5">
              <p className="text-[13px] font-semibold text-red-400 leading-snug">
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-colors cursor-pointer disabled:cursor-not-allowed bg-[#d4af37] text-[#0A1128] hover:bg-[#c4a030] disabled:bg-[rgba(212,175,55,0.3)] disabled:text-[rgba(212,175,55,0.6)]"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}