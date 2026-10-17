import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Per-request Supabase client for Server Components and Route Handlers. It acts
// as the signed-in user (via the session cookies), unlike supabaseAdmin which
// bypasses RLS. Always use getUser() — not getSession() — to decide who is
// calling, because getUser() re-validates the token with Supabase.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component, which can't set cookies. Fine:
            // middleware refreshes the session on every request.
          }
        },
      },
    }
  )
}
