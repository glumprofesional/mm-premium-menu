import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    // Get user email from query params
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const { data: credentials, error: credError } = await adminDb
      .from("passkey_credentials")
      .select("id")
      .eq("user_email", email)

    if (credError) {
      console.error("Error checking credentials:", credError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      hasCredentials: credentials && credentials.length > 0,
    })
  } catch (error) {
    console.error("Check credentials error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}