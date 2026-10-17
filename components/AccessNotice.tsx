import { ADMIN_EMAIL, ADMIN_NAME } from '../lib/auth'

export default function AccessNotice() {
  return (
    <p className="text-sm text-gray-600 text-center">
      To get access to this page, contact admin {ADMIN_NAME} at{' '}
      <a href={`mailto:${ADMIN_EMAIL}`} className="text-blue-600 hover:underline">
        {ADMIN_EMAIL}
      </a>
      .
    </p>
  )
}
