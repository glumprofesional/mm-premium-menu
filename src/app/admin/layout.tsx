import Image from 'next/image'
import type { Metadata } from 'next'
import { adminDb } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'
import OpenCartaButton from './OpenCartaButton'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'M&M Admin',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/apple-touch-icon.png',
  },
}

const swRegisterScript = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
`;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
        {children}
      </>
    )
  }

  const { data: allowed } = await adminDb
    .from('allowed_users')
    .select('id, role')
    .eq('email', user.email)
    .single()

  if (!allowed) {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fde8e5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#da5a47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="text-lg font-bold text-[#14130e] mb-2">Acceso no autorizado</h1>
            <p className="text-sm text-[#6b6858] mb-4">Tu cuenta no tiene permisos para acceder al panel de administración.</p>
            <form action="/admin/api/logout" method="POST">
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer">Cerrar sesión</button>
            </form>
          </div>
        </div>
      </>
    )
  }

  const role = allowed.role as 'super_admin' | 'admin'

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-30 bg-[#eee7d4] border-b-2 border-[#da5a47]">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 h-auto min-h-[64px] sm:h-16 flex items-center justify-between py-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/images/logo.png"
                alt="M&M Multiespacio"
                width={64}
                height={64}
                className="rounded-lg w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
              />
              <div className="flex flex-col">
                <span className="font-bold text-[#14130e] text-sm sm:text-lg">
                  M&M Admin
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#6b6858] bg-[#d4cbaf] px-1.5 py-0.5 rounded leading-tight w-fit">
                  {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <OpenCartaButton />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </>
  )
}
