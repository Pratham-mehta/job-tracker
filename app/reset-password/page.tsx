import ResetPasswordForm from '../../components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a new password</h1>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
