// src/app/admin/api/webauthn/login-verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyAuthenticationResponse } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { toBase64url, fromBase64url, getHost, getRPID, getOrigin } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    // 1. Get challenge and email from cookies
    const cookieStore = await cookies()
    const challenge = cookieStore.get("webauthn_challenge")?.value
    const email = cookieStore.get("webauthn_email")?.value

    if (!challenge || !email) {
      return NextResponse.json({ error: "Sesión expirada. Intentá de nuevo." }, { status: 400 })
    }

    // 2. Parse the authentication response
    const body = await req.json()
    const credential = body.credential || body

    // 3. Get stored credential from database
    const { data: storedCredential, error: credError } = await adminDb
      .from("passkey_credentials")
      .select("id, credential_id, public_key, counter")
      .eq("user_email", email)
      .single()

    if (credError || !storedCredential) {
      return NextResponse.json({ error: "Credencial no encontrada" }, { status: 404 })
    }

    // 4. Verify the authentication response
    const host = getHost(req.headers)
    const rpID = getRPID(host)
    const origin = getOrigin(host)

    // Convert public_key from base64url string to ArrayBuffer
    const publicKeyRaw = fromBase64url(storedCredential.public_key)
    const publicKeyBuffer = new Uint8Array(publicKeyRaw.buffer.slice(publicKeyRaw.byteOffset, publicKeyRaw.byteOffset + publicKeyRaw.byteLength))

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: storedCredential.credential_id,
        publicKey: publicKeyBuffer as unknown as Uint8Array<ArrayBuffer>,
        counter: storedCredential.counter,
      },
    })

    if (!verification.verified) {
      return NextResponse.json({ error: "Verificación fallida" }, { status: 400 })
    }

    // 5. Update counter in database
    await adminDb
      .from("passkey_credentials")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("id", storedCredential.id)

    // 6. Create Supabase session using admin API
    const { data: linkData, error: linkError } = await adminDb.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (linkError || !linkData?.properties?.email_otp) {
      console.error("[login-verify] generateLink error:", linkError)
      return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 })
    }

    // Verify OTP to establish session (sets cookies via server client)
    const supabase = await createClient()
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: linkData.properties.email_otp,
      type: "magiclink",
    })

    if (otpError) {
      console.error("[login-verify] verifyOtp error:", otpError)
      return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 })
    }

    // 7. Clean up challenge cookies
    const response = NextResponse.json({ verified: true })
    response.cookies.set("webauthn_challenge", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
    response.cookies.set("webauthn_email", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[login-verify] Error:", error)
    const message = error instanceof Error ? error.message : "Error desconocido"

    if (message.includes("challenge")) {
      return NextResponse.json({ error: "Sesión expirada. Recargá la página." }, { status: 400 })
    }

    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}