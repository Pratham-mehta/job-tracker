import Link from 'next/link'
import ForgotPasswordForm from '../../components/ForgotPasswordForm'
import AccessNotice from '../../components/AccessNotice'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
          <p className="text-gray-600">
            Enter your email and we&apos;ll send you a link to choose a new password.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <ForgotPasswordForm />
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <AccessNotice />
        </div>
      </div>
    </div>
  )
}
