import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safeNextPath } from './lib/auth'

// Everything NOT listed here requires a signed-in user.
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password', // the page itself checks for a recovery session
  '/auth', // /auth/callback exchanges the emailed reset link for a session
  '/api/unsubscribe', // one-click link in digest emails, guarded by its own token
  '/api/daily-digest', // called by Vercel Cron, guarded by CRON_SECRET
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    }
  )

  // getUser() re-validates the JWT with Supabase (getSession() only reads the
  // cookie and can be forged). It also refreshes an expiring session, which is
  // why the cookies set above must be carried onto whatever we return.
  // If Supabase is unreachable the user is treated as signed out (fail closed).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (!user && !isPublic(pathname)) {
    if (pathname.startsWith('/api/')) {
      return withCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), response)
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', pathname + search)
    return withCookies(NextResponse.redirect(url), response)
  }

  if (user && pathname === '/login') {
    const next = safeNextPath(request.nextUrl.searchParams.get('next'))
    return withCookies(NextResponse.redirect(new URL(next, request.url)), response)
  }

  return response
}

function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie))
  source.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'cache-control') target.headers.set(key, value)
  })
  return target
}

export const config = {
  matcher: [
    // Skip Next internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
