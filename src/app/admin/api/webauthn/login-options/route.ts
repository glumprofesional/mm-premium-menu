// src/app/admin/api/webauthn/login-options/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateAuthenticationOptions } from "@simplewebauthn/server"
import { createClient } from "@/lib/supabase/admin"
import { getRpConfig } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const supabase = createClient()
    const { data: allowedUser, error: allowedError } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", email)
      .single()

    if (allowedError || !allowedUser) {
      return NextResponse.json(
        { error: "No se encontraron credenciales para este email." },
        { status: 404 }
      )
    }

    const { data: credentials } = await supabase
      .from("passkey_credentials")
      .select("credential_id, transports")
      .eq("user_email", email)

    if (!credentials || credentials.length === 0) {
      return NextResponse.json(
        { error: "No tenés credenciales biométricas registradas. Ingresá con contraseña primero." },
        { status: 404 }
      )
    }

    const allowCredentials = credentials.map((cred) => {
      const base64 = cred.credential_id.replace(/-/g, "+").replace(/_/g, "/")
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
      const buf = Buffer.from(padded, "base64")
      const id = new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

      return {
        id,
        type: "public-key" as const,
        transports: (cred.transports as AuthenticatorTransport[]) || ["internal"],
      }
    })

    const { rpID } = getRpConfig(req.headers)

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: "preferred",
    })

    const challengeB64 = Buffer.from(options.challenge).toString("base64url")
    const response = NextResponse.json({ options })
    response.cookies.set("webauthn_login_challenge", challengeB64, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 120,
    })
    response.cookies.set("webauthn_login_email", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 120,
    })

    return response
  } catch (err) {
    console.error("[login-options] Error:", err)
    return NextResponse.json(
      { error: "Error al generar opciones de autenticación" },
      { status: 500 }
    )
  }
}