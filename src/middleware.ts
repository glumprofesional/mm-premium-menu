import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Excluir API routes del middleware
  if (request.nextUrl.pathname.startsWith("/admin/api/")) {
    return
  }
  return await updateSession(request)
}

export const config = {
  matcher: ["/admin/:path*"],
}