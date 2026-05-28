// src/app/admin/api/webauthn/register-verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyRegistrationResponse } from "@simplewebauthn/server"
import { createClient } from "@/lib/supabase/admin"
import { toBase64url, getRpConfig } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const challengeB64 = cookieStore.get("webauthn_register_challenge")?.value

    if (!challengeB64) {
      return NextResponse.json(
        { error: "Challenge no encontrado. Intentá de nuevo." },
        { status: 400 }
      )
    }

    const authToken = cookieStore.get("sb-access-token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 })
    }

    const email = user.email
    const body = await req.json()

    const { rpID, origin } = getRpConfig(req.headers)

    const verification = await verifyRegistrationResponse({
      response: body,
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

    const { registrationInfo } = verification
    const credential = registrationInfo.credential
    const credentialId = typeof credential.id === "string"
      ? credential.id
      : toBase64url(credential.id)
    const publicKey = toBase64url(credential.publicKey)
    const counter = 0

    const { error: insertError } = await supabase
      .from("passkey_credentials")
      .insert({
        user_email: email,
        credential_id: credentialId,
        public_key: publicKey,
        counter,
        transports: body.response?.transports || [],
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