import { createClient } from '@supabase/supabase-js'

// Public client for the menu pages (no cookies dependency).
// Uses the anon key and respects RLS policies.
export const publicDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
