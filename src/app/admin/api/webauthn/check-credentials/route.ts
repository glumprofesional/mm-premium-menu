// src/app/admin/api/webauthn/check-credentials/route.ts
import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    // 1. Verify user is authenticated (using Supabase server client)
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // 2. Check for credentials
    const { data: credentials, error: credError } = await adminDb
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