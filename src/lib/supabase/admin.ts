import { createClient } from '@supabase/supabase-js'

// IMPORTANT: This client is only for server-side use with the service role key.
// NEVER expose this client or the service role key to the browser.

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. This client is for server-side use only.')
}

export const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
