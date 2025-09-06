'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (name, careers_url)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error:', error)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  async function updateJobStatus(jobId, newStatus) {
    const { error } = await supabase
      .from('jobs')
      .update({ 
        application_stage: newStatus,
        applied_date: newStatus === 'Applied' ? new Date().toISOString().split('T')[0] : null
      })
      .eq('id', jobId)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      fetchJobs() // Refresh the jobs list
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'interview': case 'phone screen': case 'onsite': return 'bg-yellow-100 text-yellow-800'
      case 'offer': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    if (filter === 'unapplied') return !job.application_stage || job.application_stage === 'Considering'
    return job.application_stage?.toLowerCase() === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Tracker</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">Filter:</span>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Jobs ({jobs.length})</option>
              <option value="unapplied">Not Applied ({jobs.filter(j => !j.application_stage || j.application_stage === 'Considering').length})</option>
              <option value="applied">Applied ({jobs.filter(j => j.application_stage?.toLowerCase() === 'applied').length})</option>
              <option value="interview">Interview ({jobs.filter(j => j.application_stage?.toLowerCase().includes('interview')).length})</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {/* Company & Status */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{job.companies?.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.application_stage)}`}>
                    {job.application_stage || 'Not Applied'}
                  </span>
                </div>
              </div>

              {/* Job Title */}
              <h4 className="font-medium text-gray-800 mb-2">{job.title}</h4>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Salary:</span>
                    <span>{job.salary_range}</span>
                  </div>
                )}
                {job.experience_required && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Experience:</span>
                    <span>{job.experience_required}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Recruiter:</span>
                  <span className={job.recruiter_contact ? "text-blue-600" : "text-gray-400 italic"}>
                    {job.recruiter_contact || "Contact details not available"}
                  </span>
                </div>
                {job.applied_date && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Applied:</span>
                    <span>{new Date(job.applied_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <select 
                  value={job.application_stage || ''}
                  onChange={(e) => updateJobStatus(job.id, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Update Status...</option>
                  <option value="Considering">Considering</option>
                  <option value="Applied">Applied</option>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Interview">Interview</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                
                {job.job_url && (
                  <a 
                    href={job.job_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    View Job
                  </a>
                )}
              </div>

              {/* Notes */}
              {job.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</span>
                  <p className="text-sm text-gray-600 mt-1">{job.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No jobs found for the selected filter.</div>
          </div>
        )}
      </div>
    </div>
  )
}