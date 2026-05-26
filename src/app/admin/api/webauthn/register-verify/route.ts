import { cookies } from 'next/headers';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';
import { getRPID, getOrigin, toBase64url } from '@/lib/webauthn';

export async function POST(request: Request) {
  try {
    // 1. Verify the user is authenticated
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.email) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Get challenge from cookie
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn-challenge')?.value;

    if (!expectedChallenge) {
      return Response.json({ error: 'Challenge expirado. Intente de nuevo.' }, { status: 400 });
    }

    // 3. Get the registration response from the client
    const body = await request.json();
    const host = request.headers.get('host') || 'localhost:3000';
    const rpID = getRPID(host);
    const expectedOrigin = getOrigin(host);

    // 4. Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: 'Verificación fallida' }, { status: 400 });
    }

    // 5. Save the credential to the database
    const { registrationInfo } = verification;
    const credentialId = toBase64url(registrationInfo.credentialID);
    const publicKey = toBase64url(registrationInfo.credentialPublicKey);

    const { error: insertError } = await adminDb
      .from('passkey_credentials')
      .insert({
        user_email: user.email,
        credential_id: credentialId,
        public_key: publicKey,
        counter: registrationInfo.counter,
        transports: registrationInfo.credentialDeviceType === 'singleDevice'
          ? ['internal']
          : ['internal', 'hybrid'],
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return Response.json({ error: 'Esta biometría ya está registrada.' }, { status: 409 });
      }
      console.error('Error saving credential:', insertError);
      return Response.json({ error: 'Error guardando credencial' }, { status: 500 });
    }

    // 6. Clean up challenge cookie
    cookieStore.delete('webauthn-challenge');

    return Response.json({ verified: true });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}