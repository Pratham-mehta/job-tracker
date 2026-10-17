'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setStatus('error')
      setMessage(
        error.status === 429
          ? 'Too many requests. Please wait a few minutes and try again.'
          : "We couldn't send the reset email. Please try again."
      )
      return
    }

    // Same message whether or not the address has an account, so this form
    // can't be used to find out who has access.
    setStatus('sent')
    setMessage('If an account exists for that email, a password reset link is on its way.')
  }

  if (status === 'sent') {
    return (
      <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}
