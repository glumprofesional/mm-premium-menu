// src/app/admin/api/webauthn/register-options/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { toBase64url, getRPID, getOrigin, getHost } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const cookieStore = await cookies()
    const authToken = cookieStore.get("sb-access-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // 2. Get user email from Supabase admin
    const { data: { user }, error: userError } = await adminDb.auth.getUser(authToken)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 })
    }

    const email = user.email

    // 3. Check user is in allowed_users
    const { data: allowedUser, error: allowedError } = await adminDb
      .from("allowed_users")
      .select("email")
      .eq("email", email)
      .single()

    if (allowedError || !allowedUser) {
      return NextResponse.json({ error: "Usuario no autorizado" }, { status: 403 })
    }

    // 4. Get existing credentials for exclusion list
    const { data: existingCreds } = await adminDb
      .from("passkey_credentials")
      .select("credential_id")
      .eq("user_email", email)

    // In @simplewebauthn/server v13+, excludeCredentials id is a base64url string
    const excludeCredentials = (existingCreds || []).map((cred) => ({
      id: cred.credential_id,
      type: "public-key" as const,
    }))

    // 5. Derive rpID and origin from request headers
    const host = getHost(req.headers)
    const rpID = getRPID(host)
    const origin = getOrigin(host)

    // 6. Generate registration options
    const options = await generateRegistrationOptions({
      rpName: "M&M Multiespacio",
      rpID,
      userName: email,
      userDisplayName: email.split("@")[0],
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
      excludeCredentials,
      timeout: 120000,
    })

    // 7. Store challenge in cookie (2 minutes)
    const challenge = toBase64url(options.challenge)
    const response = NextResponse.json({ options })
    response.cookies.set("webauthn_register_challenge", challenge, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 120,
    })

    return response
  } catch (err) {
    console.error("[register-options] Error:", err)
    return NextResponse.json(
      { error: "Error al generar opciones de registro" },
      { status: 500 }
    )
  }
}