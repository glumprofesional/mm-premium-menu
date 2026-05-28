import { cookies } from 'next/headers';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';
import { getRPID, getOrigin, toBase64url } from '@/lib/webauthn';

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.email) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn-challenge')?.value;

    if (!expectedChallenge) {
      return Response.json({ error: 'Challenge expirado. Intente de nuevo.' }, { status: 400 });
    }

    const body = await request.json();
    const host = request.headers.get('host') || 'localhost:3000';
    const rpID = getRPID(host);
    const expectedOrigin = getOrigin(host);

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: 'Verificacion fallida' }, { status: 400 });
    }

    const { registrationInfo } = verification;
    const credential = registrationInfo.credential;
    const credentialId = typeof credential.id === 'string' ? credential.id : toBase64url(credential.id);
    const publicKey = toBase64url(credential.publicKey);

    const { error: insertError } = await adminDb
      .from('passkey_credentials')
      .insert({
        user_email: user.email,
        credential_id: credentialId,
        public_key: publicKey,
        counter: credential.counter,
        transports: ['internal'],
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return Response.json({ error: 'Esta biometria ya esta registrada.' }, { status: 409 });
      }
      console.error('Error saving credential:', insertError);
      return Response.json({ error: 'Error guardando credencial' }, { status: 500 });
    }

    cookieStore.delete('webauthn-challenge');

    return Response.json({ verified: true });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}