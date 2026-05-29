import { NextRequest, NextResponse } from "next/server"
import { verifyRegistrationResponse } from "@simplewebauthn/server"
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

    const host = getHost(req.headers)
    const rpID = getRPID(host)
    const origin = getOrigin(host)

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification
      const credentialId = registrationInfo.credential.id
      const publicKey = registrationInfo.credential.publicKey
      const counter = registrationInfo.credential.counter
      const transports = credential.response.transports || []

      // Store credential in database
      const { error: insertError } = await adminDb
        .from("passkey_credentials")
        .insert({
          user_email: email,
          credential_id: credentialId,
          public_key: publicKey,
          counter: counter,
          transports: transports,
        })

      if (insertError) {
        console.error("Error storing credential:", insertError)
        return NextResponse.json({ error: "Failed to store credential" }, { status: 500 })
      }

      const response = NextResponse.json({ verified: true })
      response.cookies.delete("webauthn_challenge")
      response.cookies.delete("webauthn_email")
      return response
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 400 })
  } catch (error) {
    console.error("Registration verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}