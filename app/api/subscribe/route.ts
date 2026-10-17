import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Any signed-in user can subscribe an email to the daily job alert digest.
// (Middleware rejects signed-out callers with a 401 before this runs.)
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Upsert on email so someone who previously unsubscribed can resubscribe
    // just by submitting the form again.
    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        { email: normalizedEmail, unsubscribed_at: null },
        { onConflict: 'email' }
      )

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: "You're subscribed! Expect a daily email with jobs no one has applied to yet.",
    })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
