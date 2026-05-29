import { NextRequest, NextResponse } from "next/server"
import { generateAuthenticationOptions } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { getHost, getRPID } from "@/lib/webauthn"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Verify user is allowed
    const { data: allowedUser, error: allowedError } = await adminDb
      .from("allowed_users")
      .select("email")
      .eq("email", email)
      .single()

    if (allowedError || !allowedUser) {
      return NextResponse.json({ error: "User not authorized" }, { status: 403 })
    }

    // Get existing credentials
    const { data: credentials } = await adminDb
      .from("passkey_credentials")
      .select("credential_id, transports")
      .eq("user_email", email)

    const allowCredentials = (credentials || []).map((cred: { credential_id: string; transports: string[] | null }) => ({
      id: cred.credential_id,
      type: "public-key" as const,
      transports: (cred.transports as AuthenticatorTransport[]) || ["internal"],
    }))

    const host = getHost(req.headers)
    const rpID = getRPID(host)

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: "required",
    })

    // Store challenge in cookie
    const response = NextResponse.json(options)
    response.cookies.set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    })
    response.cookies.set("webauthn_email", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login options error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}