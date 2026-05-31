// src/app/admin/api/webauthn/register-verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyRegistrationResponse } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { toBase64url, getRPID, getOrigin, getHost } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    // 1. Get challenge from cookie
    const cookieStore = await cookies()
    const challengeB64 = cookieStore.get("webauthn_register_challenge")?.value

    if (!challengeB64) {
      return NextResponse.json(
        { error: "Challenge no encontrado. Intentá de nuevo." },
        { status: 400 }
      )
    }

    // 2. Verify user is authenticated (using Supabase server client)
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.email

    // 3. Parse the registration response from the client
    const body = await req.json()
    const credential = body.credential || body

    // 4. Derive expected origin and rpID from request headers
    const host = getHost(req.headers)
    const rpID = getRPID(host)
    const origin = getOrigin(host)

    // 5. Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challengeB64,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Verificación fallida. Intentá de nuevo." },
        { status: 400 }
      )
    }

    // 6. Extract credential info
    const { registrationInfo } = verification
    const credInfo = registrationInfo.credential
    const credentialId = typeof credInfo.id === "string"
      ? credInfo.id
      : toBase64url(credInfo.id)
    const publicKey = toBase64url(credInfo.publicKey)
    const counter = 0
    const transports = credential.response?.transports || []

    // 7. Save credential to database
    const { error: insertError } = await adminDb
      .from("passkey_credentials")
      .insert({
        user_email: email,
        credential_id: credentialId,
        public_key: publicKey,
        counter,
        transports,
      })

    if (insertError) {
      console.error("[register-verify] DB insert error:", insertError)

      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Esta credencial ya está registrada." },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Error al guardar credencial en la base de datos." },
        { status: 500 }
      )
    }

    // 8. Clear the challenge cookie
    const response = NextResponse.json({ verified: true })
    response.cookies.set("webauthn_register_challenge", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (err) {
    console.error("[register-verify] Error:", err)
    const message = err instanceof Error ? err.message : "Error desconocido"

    if (message.includes("challenge")) {
      return NextResponse.json(
        { error: "Sesión expirada. Recargá la página e intentá de nuevo." },
        { status: 400 }
      )
    }
    if (message.includes("origin") || message.includes("rpID") || message.includes("RP")) {
      return NextResponse.json(
        { error: "Error de configuración del servidor. Contactá al administrador." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Error al verificar el registro: " + message },
      { status: 500 }
    )
  }
}