import { NextRequest, NextResponse } from "next/server"
import { verifyAuthenticationResponse } from "@simplewebauthn/server"
import { adminDb } from "@/lib/supabase/admin"
import { getHost, getRPID, getOrigin } from "@/lib/webauthn"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { credential } = body

    const challenge = req.cookies.get("webauthn_challenge")?.value
    const email = req.cookies.get("webauthn_email")?.value

    if (!challenge || !email) {
      return NextResponse.json({ error: "Missing challenge or email" }, { status: 400 })
    }

    // Get stored credential
    const { data: storedCredential, error: credError } = await adminDb
      .from("passkey_credentials")
      .select("id, credential_id, public_key, counter")
      .eq("user_email", email)
      .single()

    if (credError || !storedCredential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 })
    }

    const host = getHost(req.headers)
    const rpID = getRPID(host)
    const origin = getOrigin(host)

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: storedCredential.credential_id,
        publicKey: storedCredential.public_key,
        counter: storedCredential.counter,
      },
    })

    if (verification.verified) {
      // Update counter
      await adminDb
        .from("passkey_credentials")
        .update({ counter: verification.authenticationInfo.newCounter })
        .eq("id", storedCredential.id)

      // Create Supabase session via admin API
      const { data: linkData, error: linkError } = await adminDb.auth.admin.generateLink({
        type: "magiclink",
        email,
      })

      if (linkError || !linkData) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
      }

      const response = NextResponse.json({ verified: true })
      response.cookies.delete("webauthn_challenge")
      response.cookies.delete("webauthn_email")
      return response
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 })
  } catch (error) {
    console.error("Login verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}