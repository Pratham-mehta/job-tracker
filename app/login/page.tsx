import LoginForm from '../../components/LoginForm'
import AccessNotice from '../../components/AccessNotice'
import { safeNextPath } from '../../lib/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Tracker</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          {error === 'link_expired' && (
            <p
              role="alert"
              className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
            >
              That password reset link is invalid or has expired. Request a new one with
              &ldquo;Forgot password?&rdquo; below.
            </p>
          )}
          <LoginForm next={safeNextPath(next)} />
        </div>

        <div className="mt-6">
          <AccessNotice />
        </div>
      </div>
    </div>
  )
}
