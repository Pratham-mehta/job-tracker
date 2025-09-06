'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/jobs" className="text-xl font-bold text-gray-900">
            Job Tracker
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              href="/jobs" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/jobs' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Jobs
            </Link>
            <Link 
              href="/jobs/add" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/jobs/add' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Job
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}