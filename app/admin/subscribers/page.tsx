import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '../../../lib/supabaseServer'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { isAdminEmail } from '../../../lib/auth'

export const dynamic = 'force-dynamic'

type Subscriber = {
  email: string
  subscribed_at: string
  unsubscribed_at: string | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// The subscribers table has RLS enabled with no policies, so the only way to
// read it is the service-role client. That makes this check the gate: only the
// admin's signed-in session may get here. The unsubscribe_token column is
// deliberately never selected.
export default async function SubscribersPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin/subscribers')

  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Admin access only</h1>
          <p className="text-gray-600 mb-4">The subscriber list is restricted to the site admin.</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('email, subscribed_at, unsubscribed_at')
    .order('subscribed_at', { ascending: false })

  const subscribers = (data ?? []) as Subscriber[]
  const activeCount = subscribers.filter((s) => !s.unsubscribed_at).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email subscribers</h1>
        <p className="text-gray-600 mb-6">
          {activeCount} active &middot; {subscribers.length - activeCount} unsubscribed
        </p>

        {error ? (
          <p role="alert" className="text-red-600">
            Couldn&apos;t load subscribers. Check the server logs.
          </p>
        ) : subscribers.length === 0 ? (
          <p className="text-gray-500">No subscribers yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Subscribed</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-900">{s.email}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(s.subscribed_at)}</td>
                    <td className="px-4 py-3">
                      {s.unsubscribed_at ? (
                        <span className="text-gray-500">
                          Unsubscribed {formatDate(s.unsubscribed_at)}
                        </span>
                      ) : (
                        <span className="text-green-700">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
