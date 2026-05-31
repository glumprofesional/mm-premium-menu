import Image from "next/image"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "./LogoutButton"
import OpenCartaButton from "./OpenCartaButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario, solo renderizar children (middleware redirige a /admin/login)
  if (!user) {
    return <>{children}</>
  }

  // Si el usuario no está en allowed_users, solo renderizar children
  const { data: allowed } = await adminDb
    .from("allowed_users")
    .select("id, role")
    .eq("email", user.email)
    .single()

  if (!allowed) {
    return <>{children}</>
  }

  const role = allowed.role as "super_admin" | "admin"

  // Usuario autenticado y autorizado → mostrar layout completo con header
  return (
    <div className="min-h-screen bg-[#e6dec8]">
      {/* Header */}
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
                {role === "super_admin" ? "Super Admin" : "Admin"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
              <OpenCartaButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}