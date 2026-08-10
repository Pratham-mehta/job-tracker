import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

// One-click unsubscribe link included in every digest email.
// Each subscriber row has its own random unsubscribe_token, so the link
// doesn't require the visitor to log in or prove anything beyond having
// received the email.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing unsubscribe token' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)

  if (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 60px 20px;">
        <h2>You've been unsubscribed</h2>
        <p style="color: #64748b;">You won't receive any more job alert emails.</p>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
