import { cookies } from 'next/headers';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';
import { getRPID, getOrigin, fromBase64url } from '@/lib/webauthn';

export async function POST(request: Request) {
  try {
    // 1. Get challenge and email from cookies
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn-challenge')?.value;
    const userEmail = cookieStore.get('webauthn-login-email')?.value;

    if (!expectedChallenge || !userEmail) {
      return Response.json({ error: 'Challenge expirado. Intente de nuevo.' }, { status: 400 });
    }

    // 2. Get the authentication response from the client
    const body = await request.json();
    const host = request.headers.get('host') || 'localhost:3000';
    const rpID = getRPID(host);
    const expectedOrigin = getOrigin(host);

    // 3. Find the credential in the database
    const { data: credential } = await adminDb
      .from('passkey_credentials')
      .select('id, credential_id, public_key, counter, transports, user_email')
      .eq('credential_id', body.id)
      .eq('user_email', userEmail)
      .single();

    if (!credential) {
      return Response.json({ error: 'Credencial no encontrada' }, { status: 401 });
    }

    // 4. Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.credential_id,
        publicKey: fromBase64url(credential.public_key),
        counter: credential.counter,
        transports: (credential.transports || ['internal']) as AuthenticatorTransport[],
      },
    });

    if (!verification.verified) {
      return Response.json({ error: 'Verificación fallida' }, { status: 401 });
    }

    // 5. Update the counter in the database
    await adminDb
      .from('passkey_credentials')
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq('id', credential.id);

    // 6. Create a Supabase session using admin-generated magic link
    const { data: linkData, error: linkError } = await adminDb.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('Error generating magic link:', linkError);
      return Response.json({ error: 'Error creando sesión' }, { status: 500 });
    }

    // 7. Verify the OTP to establish the session (sets auth cookies)
    const supabaseServer = await createClient();
    const { error: otpError } = await supabaseServer.auth.verifyOtp({
      email: userEmail,
      token: linkData.properties.email_otp,
      type: 'magiclink',
    });

    if (otpError) {
      console.error('Error verifying OTP:', otpError);
      return Response.json({ error: 'Error creando sesión' }, { status: 500 });
    }

    // 8. Clean up cookies
    cookieStore.delete('webauthn-challenge');
    cookieStore.delete('webauthn-login-email');

    return Response.json({ verified: true });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}