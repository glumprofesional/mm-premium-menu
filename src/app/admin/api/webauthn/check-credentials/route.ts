// src/app/admin/api/webauthn/check-credentials/route.ts
import { NextResponse } from "next/server"
import { adminDb } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("sb-access-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: { user }, error: userError } = await adminDb.auth.getUser(authToken)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 })
    }

    const { data: credentials, error: credError } = await supabase
      .from("passkey_credentials")
      .select("id")
      .eq("user_email", user.email)

    if (credError) {
      console.error("[check-credentials] Error:", credError)
      return NextResponse.json({ hasCredentials: false }, { status: 200 })
    }

    return NextResponse.json({
      hasCredentials: (credentials?.length || 0) > 0,
    })
  } catch (err) {
    console.error("[check-credentials] Error:", err)
    return NextResponse.json({ hasCredentials: false }, { status: 200 })
  }
}