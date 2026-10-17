'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { MIN_PASSWORD_LENGTH } from '../lib/auth'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [session, setSession] = useState<'checking' | 'ok' | 'missing'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // /auth/callback signs the user in with the emailed link; without that
  // session there is nothing to reset (link expired, already used, or opened
  // in a different browser than the one that asked for it).
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ? 'ok' : 'missing'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => {
      router.replace('/')
      router.refresh()
    }, 1500)
  }

  if (session === 'checking') {
    return <p className="text-sm text-gray-500 text-center">Checking your reset link...</p>
  }

  if (session === 'missing') {
    return (
      <div className="space-y-3 text-center">
        <p role="alert" className="text-sm text-red-600">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
        Password updated. Taking you to the app...
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
