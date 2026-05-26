import { cookies } from 'next/headers';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';
import { getRPID, RP_NAME } from '@/lib/webauthn';

export async function POST(request: Request) {
  try {
    // 1. Verify the user is authenticated
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.email) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Verify the user is in allowed_users
    const { data: allowedUser } = await adminDb
      .from('allowed_users')
      .select('email')
      .eq('email', user.email)
      .single();

    if (!allowedUser) {
      return Response.json({ error: 'Usuario no autorizado' }, { status: 403 });
    }

    // 3. Get existing credentials for exclusion list (prevent duplicate registration)
    const { data: existingCredentials } = await adminDb
      .from('passkey_credentials')
      .select('credential_id, transports')
      .eq('user_email', user.email);

    const excludeCredentials = (existingCredentials || []).map((cred) => ({
      id: cred.credential_id,
      type: 'public-key' as const,
      transports: (cred.transports || ['internal']) as AuthenticatorTransport[],
    }));

    // 4. Get host from request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const rpID = getRPID(host);

    // 5. Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userName: user.email,
      userDisplayName: user.email,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    });

    // 6. Store challenge in cookie (2 minutes TTL)
    const cookieStore = await cookies();
    cookieStore.set('webauthn-challenge', options.challenge, {
      httpOnly: true,
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      maxAge: 120,
      path: '/admin/api/webauthn',
    });

    return Response.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}