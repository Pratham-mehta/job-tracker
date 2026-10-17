'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { isAdminEmail } from '../lib/auth'

// Thin bar shown only while signed in. The email/admin link are display-only:
// access to /admin/subscribers is enforced on the server, not here.
export default function AuthHeader() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  if (!email) return null

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold text-gray-900">
          Job Tracker
        </Link>
        <div className="flex items-center gap-4">
          {isAdminEmail(email) && (
            <Link href="/admin/subscribers" className="text-gray-600 hover:text-gray-900">
              Subscribers
            </Link>
          )}
          <span className="text-gray-500 hidden sm:inline">{email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
