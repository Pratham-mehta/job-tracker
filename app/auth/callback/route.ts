import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseServer'
import { safeNextPath } from '../../../lib/auth'

// Landing point for the link in the password-reset email. It turns the link
// into a signed-in "recovery" session and sends the user on to /reset-password.
// Two link formats are supported:
//   ?code=...                  PKCE. Works with Supabase's default email
//                              template, but must be opened in the same browser
//                              that requested the reset.
//   ?token_hash=...&type=...   Works from any browser/device. Needs the custom
//                              template described in the README.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeNextPath(searchParams.get('next'), '/reset-password')
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')

  const supabase = await createSupabaseServerClient()

  let failed = true
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    failed = !!error
  } else if (tokenHash && searchParams.get('type') === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
    failed = !!error
  }

  return NextResponse.redirect(new URL(failed ? '/login?error=link_expired' : next, origin))
}
