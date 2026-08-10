import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-only client using the Supabase service role key — it bypasses Row
// Level Security entirely. Only ever import this from API routes / server
// code (never from a 'use client' component), so the key is never sent to
// the browser. Used for the subscribers table, which stays locked down to
// anon access so the public job-tracking anon key can't read/edit emails.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
