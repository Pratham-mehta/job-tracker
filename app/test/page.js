'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name)
        `)
      
      if (error) {
        console.error('Error:', error)
      } else {
        setJobs(data)
      }
      setLoading(false)
    }

    fetchJobs()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Connection Test</h1>
      <pre>{JSON.stringify(jobs, null, 2)}</pre>
    </div>
  )
}