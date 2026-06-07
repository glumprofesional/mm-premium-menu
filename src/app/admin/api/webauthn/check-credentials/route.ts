// src/app/admin/api/webauthn/check-credentials/route.ts
import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  // Rate limit: 5 requests per IP per minute
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  const { allowed } = rateLimit(ip, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ hasCredentials: false }, { status: 429 })
  }

  try {
    // Get email from query param (works without authentication)
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      // Try authenticated user as fallback
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        return NextResponse.json({ hasCredentials: false }, { status: 200 })
      }

      const { data: credentials } = await adminDb
        .from("passkey_credentials")
        .select("id")
        .eq("user_email", user.email)

      return NextResponse.json({
        hasCredentials: (credentials?.length || 0) > 0,
      })
    }

    // Check for credentials by email (no auth required)
    const { data: credentials, error: credError } = await adminDb
      .from("passkey_credentials")
      .select("id")
      .eq("user_email", email)

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