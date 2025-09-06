import { Resend } from 'resend'
import { supabase } from '../../../lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Get jobs that haven't been applied to
    const { data: unappliedJobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (name)
      `)
      .or('application_stage.is.null,application_stage.eq.Considering')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    if (!unappliedJobs || unappliedJobs.length === 0) {
      return NextResponse.json({ 
        message: 'No unapplied jobs found',
        count: 0 
      })
    }

    // Create email content
    const emailContent = generateEmailContent(unappliedJobs)

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>', // You'll need to update this
      to: ['pm3483@nyu.edu'], // Update with your email
      subject: `Job Reminder: ${unappliedJobs.length} jobs waiting for your application`,
      html: emailContent,
    })

    if (emailError) {
      throw emailError
    }

    return NextResponse.json({ 
      message: 'Reminder email sent successfully',
      count: unappliedJobs.length,
      emailId: data?.id
    })

  } catch (error) {
    console.error('Error sending reminder email:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    )
  }
}

function generateEmailContent(jobs: Array<{
  companies?: { name: string } | null;
  title: string;
  location?: string | null;
  created_at: string;
}>) {
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
      <title>Job Application Reminder</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Job Application Reminder</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Don't let opportunities slip away!</p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hi Pratham!</h2>
        <p style="margin: 0; font-size: 16px;">You have <strong>${jobs.length} job${jobs.length > 1 ? 's' : ''}</strong> in your tracker that you haven't applied to yet. Here's your list:</p>
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
        <a href="http://localhost:3000/jobs" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View All Jobs
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        <p>Keep pushing forward! Every application gets you closer to your goal.</p>
        <p>Happy job hunting! 🚀</p>
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