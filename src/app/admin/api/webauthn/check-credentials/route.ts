import { createClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.email) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { count } = await adminDb
      .from('passkey_credentials')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', user.email);

    return Response.json({ hasCredential: (count ?? 0) > 0 });
  } catch (error) {
    console.error('Error checking credentials:', error);
    return Response.json({ hasCredential: false });
  }
}