import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://job-tracker-liart-pi.vercel.app'

// Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>` on
// scheduled invocations when a CRON_SECRET env var is set. Checking it here
// stops randoms from hitting this URL and mass-emailing every subscriber.
// If CRON_SECRET isn't configured yet, requests are allowed through so local
// dev / first deploy isn't blocked — set it in Vercel before going public.
function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

// Handle GET requests (for the Vercel cron trigger)
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return handleDailyDigest()
}

// Handle POST requests (for manual testing, e.g. via curl with the same header)
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return handleDailyDigest()
}

type Subscriber = { email: string; unsubscribe_token: string }
type Job = {
  companies?: { name: string } | null
  title: string
  location?: string | null
  created_at: string
}

async function handleDailyDigest() {
  try {
    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from('subscribers')
      .select('email, unsubscribe_token')
      .is('unsubscribed_at', null)

    if (subscribersError) {
      throw subscribersError
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers', count: 0 })
    }

    // Jobs nobody in the community has applied to yet.
    const { data: unappliedJobs, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select(`*, companies (name)`)
      .or('application_stage.is.null,application_stage.eq.Considering')
      .order('created_at', { ascending: false })

    if (jobsError) {
      throw jobsError
    }

    if (!unappliedJobs || unappliedJobs.length === 0) {
      return NextResponse.json({ message: 'No unapplied jobs to report', count: 0 })
    }

    const emails = (subscribers as Subscriber[]).map((subscriber) => ({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: [subscriber.email],
      subject: `Job Tracker: ${unappliedJobs.length} job${unappliedJobs.length > 1 ? 's' : ''} waiting for an application`,
      html: generateEmailContent(unappliedJobs, subscriber.unsubscribe_token),
    }))

    // Resend's batch endpoint accepts up to 100 emails per call.
    const BATCH_SIZE = 100
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      const { error: sendError } = await resend.batch.send(batch)
      if (sendError) {
        throw sendError
      }
    }

    return NextResponse.json({
      message: 'Daily digest sent',
      subscriberCount: subscribers.length,
      jobCount: unappliedJobs.length,
    })
  } catch (error) {
    console.error('Error sending daily digest:', error)
    return NextResponse.json(
      { error: 'Failed to send daily digest' },
      { status: 500 }
    )
  }
}

function generateEmailContent(jobs: Job[], unsubscribeToken: string) {
  const jobsList = jobs.map(job => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: 500;">${job.companies?.name || 'Unknown Company'}</td>
      <td style="padding: 12px;">${job.title}</td>
      <td style="padding: 12px; color: #64748b;">${job.location || 'Not specified'}</td>
      <td style="padding: 12px; color: #64748b;">${formatDate(job.created_at)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Job Tracker Daily Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Job Tracker Daily Digest</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Don't let opportunities slip away!</p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hey there!</h2>
        <p style="margin: 0; font-size: 16px;">There <strong>${jobs.length === 1 ? 'is 1 job' : `are ${jobs.length} jobs`}</strong> in the tracker that no one has applied to yet. Here's the list:</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569;">Company</th>
            <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569;">Position</th>
            <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569;">Location</th>
            <th style="padding: 15px; text-align: left; font-weight: 600; color: #475569;">Added</th>
          </tr>
        </thead>
        <tbody>
          ${jobsList}
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${SITE_URL}/jobs"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View All Jobs
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>Keep pushing forward! Every application gets the community closer to a win.</p>
        <p>Happy job hunting! 🚀</p>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
        <a href="${SITE_URL}/api/unsubscribe?token=${unsubscribeToken}" style="color: #94a3b8;">Unsubscribe from these emails</a>
      </div>

    </body>
    </html>
  `
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
