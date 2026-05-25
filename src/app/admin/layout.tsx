import { redirect } from "next/navigation"
import Image from "next/image"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "./LogoutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check allowed_users
  const { data: allowed } = await adminDb
    .from("allowed_users")
    .select("id")
    .eq("email", user.email)
    .single()

  if (!allowed) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#e6dec8]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#eee7d4] border-b-2 border-[#da5a47]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="M&M Multiespacio"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-[#14130e] text-lg hidden sm:block">
              M&M Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#6b6858] hover:bg-[#d4cbaf] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              Ver Carta
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}