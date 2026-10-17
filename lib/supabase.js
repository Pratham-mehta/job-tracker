import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Browser client. It keeps the login session in cookies (so middleware and
// server code see the same session) and sends the signed-in user's JWT with
// every request, which is what the "authenticated only" RLS policies in
// supabase/auth-lockdown.sql check.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
