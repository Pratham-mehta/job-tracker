'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddJobPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_id: '',
    new_company_name: '',
    new_company_url: '',
    title: '',
    location: '',
    salary_range: '',
    experience_required: '',
    sponsorship_offered: '',
    recruiter_contact: '',
    application_stage: 'Considering',
    job_url: '',
    notes: ''
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name')
    
    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      let companyId = formData.company_id

      // If creating a new company
      if (!companyId && formData.new_company_name) {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([
            {
              name: formData.new_company_name,
              careers_url: formData.new_company_url || null
            }
          ])
          .select()
          .single()

        if (companyError) {
          throw companyError
        }
        companyId = newCompany.id
      }

      if (!companyId) {
        alert('Please select a company or create a new one')
        setLoading(false)
        return
      }

      // Create the job
      const jobData = {
        company_id: companyId,
        title: formData.title,
        location: formData.location || null,
        salary_range: formData.salary_range || null,
        experience_required: formData.experience_required || null,
        sponsorship_offered: formData.sponsorship_offered || null,
        recruiter_contact: formData.recruiter_contact || null,
        application_stage: formData.application_stage,
        job_url: formData.job_url || null,
        notes: formData.notes || null,
        applied_date: formData.application_stage === 'Applied' ? 
          new Date().toISOString().split('T')[0] : null
      }

      const { error: jobError } = await supabase
        .from('jobs')
        .insert([jobData])

      if (jobError) {
        throw jobError
      }

      // Success - redirect to jobs page
      router.push('/jobs')
    } catch (error) {
      console.error('Error adding job:', error)
      alert('Error adding job: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add New Job</h1>
            <p className="text-gray-600 mt-1">Quickly add a job to your tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select existing company or create new...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* New Company Fields (show only if no existing company selected) */}
            {!formData.company_id && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Create New Company</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="new_company_name"
                      value={formData.new_company_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Microsoft"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Careers URL (optional)
                    </label>
                    <input
                      type="url"
                      name="new_company_url"
                      value={formData.new_company_url}
                      onChange={handleInputChange}
                      placeholder="https://careers.microsoft.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="e.g., $120k - $180k"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Required
                </label>
                <input
                  type="text"
                  name="experience_required"
                  value={formData.experience_required}
                  onChange={handleInputChange}
                  placeholder="e.g., 3-5 years"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsorship Offered
                </label>
                <input
                  type="text"
                  name="sponsorship_offered"
                  value={formData.sponsorship_offered}
                  onChange={handleInputChange}
                  placeholder="e.g., Yes, No, Case by case"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Recruiter Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruiter Contact
              </label>
              <input
                type="text"
                name="recruiter_contact"
                value={formData.recruiter_contact}
                onChange={handleInputChange}
                placeholder="e.g., John Doe (Senior Recruiter)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Application Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Stage
              </label>
              <select
                name="application_stage"
                value={formData.application_stage}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Considering">Considering</option>
                <option value="Applied">Applied</option>
                <option value="Phone Screen">Phone Screen</option>
                <option value="Interview">Interview</option>
                <option value="Onsite">Onsite</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Job URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job URL
              </label>
              <input
                type="url"
                name="job_url"
                value={formData.job_url}
                onChange={handleInputChange}
                placeholder="https://company.com/jobs/123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes about this role..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Job...' : 'Add Job'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/jobs')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}