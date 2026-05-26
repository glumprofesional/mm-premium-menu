import { cookies } from 'next/headers';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { adminDb } from '@/lib/supabase/admin';
import { getRPID } from '@/lib/webauthn';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // 1. Check if user is in allowed_users
    const { data: allowedUser } = await adminDb
      .from('allowed_users')
      .select('email')
      .eq('email', email)
      .single();

    if (!allowedUser) {
      // Don't reveal if the user exists
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 2. Get credentials for this user
    const { data: credentials } = await adminDb
      .from('passkey_credentials')
      .select('credential_id, transports')
      .eq('user_email', email);

    if (!credentials || credentials.length === 0) {
      return Response.json(
        { error: 'No hay biometría registrada para este email. Ingresá con contraseña primero.' },
        { status: 404 }
      );
    }

    // 3. Generate authentication options
    const host = request.headers.get('host') || 'localhost:3000';
    const rpID = getRPID(host);

    const allowCredentials = credentials.map((cred) => ({
      id: cred.credential_id,
      type: 'public-key' as const,
      transports: (cred.transports || ['internal']) as AuthenticatorTransport[],
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    // 4. Store challenge in cookie (2 minutes TTL)
    const cookieStore = await cookies();
    cookieStore.set('webauthn-challenge', options.challenge, {
      httpOnly: true,
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      maxAge: 120,
      path: '/admin/api/webauthn',
    });

    // 5. Store email in cookie for the verify step
    cookieStore.set('webauthn-login-email', email, {
      httpOnly: true,
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      maxAge: 120,
      path: '/admin/api/webauthn',
    });

    return Response.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}