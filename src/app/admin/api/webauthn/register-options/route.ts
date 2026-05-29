// src/app/admin/api/webauthn/register-options/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { toBase64url, getRPID, getHost } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
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

    const email = user.email

    const { data: allowedUser, error: allowedError } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", email)
      .single()

    if (allowedError || !allowedUser) {
      return NextResponse.json({ error: "Usuario no autorizado" }, { status: 403 })
    }

    const { data: existingCreds } = await supabase
      .from("passkey_credentials")
      .select("credential_id")
      .eq("user_email", email)

    const excludeCredentials = (existingCreds || []).map((cred) => ({
      id: fromBase64urlHelper(cred.credential_id),
      type: "public-key" as const,
    }))

    const host = getHost(req.headers); const rpID = getRPID(host)

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
    })

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

function fromBase64urlHelper(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  const buf = Buffer.from(padded, "base64")
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}