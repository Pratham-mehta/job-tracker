import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pratham&apos;s Job Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Stay organized and track your job applications efficiently
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link 
            href="/jobs" 
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                View All Jobs
              </h2>
              <p className="text-gray-600">
                See all your tracked jobs, update statuses, and manage your applications
              </p>
            </div>
          </Link>

          <Link 
            href="/jobs/add" 
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">➕</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Add New Job
              </h2>
              <p className="text-gray-600">
                Quickly add a new job opportunity to your tracker
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Stats - Optional */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Welcome back, Pratham! Ready to land your next opportunity?
          </p>
        </div>
      </div>
    </div>
  )
}