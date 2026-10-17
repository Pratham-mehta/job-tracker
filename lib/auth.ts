// The only account that exists by default. Other accounts are created by the
// admin in the Supabase dashboard (there is intentionally no sign-up page).
export const ADMIN_EMAIL = 'prathamadmire@gmail.com'
export const ADMIN_NAME = 'Pratham Mehta'

export const MIN_PASSWORD_LENGTH = 8

export function isAdminEmail(email?: string | null) {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL
}

const BASE = 'http://base.invalid'

// Only same-site paths are allowed as a post-login / post-reset destination.
// Parsing (instead of checking for a leading "//") also catches tricks like
// "/\evil.com" or "/<tab>/evil.com" that browsers normalise into "//evil.com".
export function safeNextPath(next: string | null | undefined, fallback = '/') {
  if (!next || !next.startsWith('/')) return fallback
  try {
    const url = new URL(next, BASE)
    if (url.origin !== BASE) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
