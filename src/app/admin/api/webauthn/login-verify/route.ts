// src/app/admin/api/webauthn/login-verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyAuthenticationResponse } from "@simplewebauthn/server"
import { createClient } from "@/lib/supabase/admin"
import { getRpConfig } from "@/lib/webauthn"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const challengeB64 = cookieStore.get("webauthn_login_challenge")?.value
    const email = cookieStore.get("webauthn_login_email")?.value

    if (!challengeB64 || !email) {
      return NextResponse.json(
        { error: "Sesión expirada. Intentá de nuevo." },
        { status: 400 }
      )
    }

    const body = await req.json()

    const supabase = createClient()
    const credentialIdFromBody = body.id || body.rawId

    const { data: credentials, error: credError } = await supabase
      .from("passkey_credentials")
      .select("*")
      .eq("user_email", email)

    if (credError || !credentials || credentials.length === 0) {
      return NextResponse.json(
        { error: "Credencial no encontrada." },
        { status: 404 }
      )
    }

    let matchedCred = credentials[0]
    if (credentialIdFromBody) {
      const matched = credentials.find(
        (c) => c.credential_id === credentialIdFromBody
      )
      if (matched) matchedCred = matched
    }

    const base64 = matchedCred.credential_id.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const buf = Buffer.from(padded, "base64")
    const credentialIdBytes = new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

    const pubKeyBase64 = matchedCred.public_key.replace(/-/g, "+").replace(/_/g, "/")
    const pubKeyPadded = pubKeyBase64 + "=".repeat((4 - (pubKeyBase64.length % 4)) % 4)
    const pubKeyBuf = Buffer.from(pubKeyPadded, "base64")
    const publicKeyBytes = new Uint8Array(pubKeyBuf.buffer.slice(pubKeyBuf.byteOffset, pubKeyBuf.byteOffset + pubKeyBuf.byteLength))

    const { rpID, origin } = getRpConfig(req.headers)

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengeB64,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credentialIdBytes,
        publicKey: publicKeyBytes,
        counter: matchedCred.counter || 0,
        transports: (matchedCred.transports as AuthenticatorTransport[]) || ["internal"],
      },
    })

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Verificación fallida." },
        { status: 400 }
      )
    }

    await supabase
      .from("passkey_credentials")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("credential_id", matchedCred.credential_id)

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[login-verify] Magic link error:", linkError)
      return NextResponse.json(
        { error: "Error al crear la sesión. Intentá con contraseña." },
        { status: 500 }
      )
    }

    const actionLink = linkData.properties.action_link
    const tokenHash = new URL(actionLink).searchParams.get("token_hash")
    const tokenType = "magiclink"

    if (!tokenHash) {
      return NextResponse.json(
        { error: "Error al crear la sesión. Intentá con contraseña." },
        { status: 500 }
      )
    }

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tokenType,
    })

    if (verifyError || !verifyData?.session) {
      console.error("[login-verify] OTP verify error:", verifyError)
      return NextResponse.json(
        { error: "Error al crear la sesión. Intentá con contraseña." },
        { status: 500 }
      )
    }

    const session = verifyData.session
    const response = NextResponse.json({ verified: true })

    response.cookies.set("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    response.cookies.set("sb-refresh-token", session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set("webauthn_login_challenge", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    response.cookies.set("webauthn_login_email", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (err) {
    console.error("[login-verify] Error:", err)
    const message = err instanceof Error ? err.message : "Error desconocido"

    if (message.includes("challenge")) {
      return NextResponse.json(
        { error: "Sesión expirada. Recargá la página e intentá de nuevo." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al verificar la autenticación: " + message },
      { status: 500 }
    )
  }
}