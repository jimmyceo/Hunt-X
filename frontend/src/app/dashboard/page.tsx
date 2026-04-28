'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface CV {
  id: string
  job_title: string
  company: string
  created_at: string
  ats_score?: number
}

interface Resume {
  id: string
  original_filename: string
  skills: string[]
  created_at: string
}

export default function Dashboard() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [user, setUser] = useState<{ name?: string; email: string; tier: string; jobs_remaining: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch user, CVs, and resumes in parallel
      const [userRes, cvsRes, resumesRes] = await Promise.allSettled([
        apiClient.getCurrentUser(),
        apiClient.listCVs().catch(() => []),
        apiClient.listResumes().catch(() => []),
      ])

      if (userRes.status === 'fulfilled') {
        setUser(userRes.value)
      }
      if (cvsRes.status === 'fulfilled' && Array.isArray(cvsRes.value)) {
        setCvs(cvsRes.value)
      }
      if (resumesRes.status === 'fulfilled' && Array.isArray(resumesRes.value)) {
        setResumes(resumesRes.value)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#061b31] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#64748d]">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-[#061b31] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light">Dashboard</h1>
            {user && (
              <p className="text-[#64748d] text-sm mt-1">Welcome back, {user.name || user.email}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/upload"
              className="px-4 py-2 border border-[#e5edf5] hover:border-[#533afd] rounded-lg transition text-sm"
            >
              Upload Resume
            </Link>
            <Link
              href="/generate"
              className="px-4 py-2 bg-[#533afd] hover:bg-[#4128c9] text-white rounded-lg transition text-sm"
            >
              + New CV
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl border border-[#e5edf5]">
            <div className="text-2xl font-light text-[#061b31]">{resumes.length}</div>
            <div className="text-[#64748d] text-sm">Resumes</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#e5edf5]">
            <div className="text-2xl font-light text-[#061b31]">{cvs.length}</div>
            <div className="text-[#64748d] text-sm">CVs Generated</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#e5edf5]">
            <div className="text-2xl font-light text-[#533afd]">{user?.jobs_remaining ?? '—'}</div>
            <div className="text-[#64748d] text-sm">Jobs Remaining</div>
          </div>
        </div>

        {/* Generated CVs */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light">Your CVs</h2>
            <Link href="/generate" className="text-sm text-[#533afd] hover:text-[#4128c9]">+ Generate New</Link>
          </div>
          {cvs.length === 0 ? (
            <div className="p-8 bg-[#f6f9fc] rounded-xl text-center border border-[#e5edf5]">
              <p className="text-[#64748d] mb-4">No CVs generated yet</p>
              <Link
                href="/generate"
                className="px-4 py-2 bg-[#533afd] hover:bg-[#4128c9] text-white rounded-lg transition"
              >
                Generate Your First CV
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <div key={cv.id} className="p-4 bg-white rounded-xl border border-[#e5edf5] flex justify-between items-center">
                  <div>
                    <div className="font-medium text-[#061b31]">{cv.job_title}</div>
                    <div className="text-[#64748d] text-sm">{cv.company}</div>
                    {cv.ats_score && (
                      <div className="text-xs text-[#15be53] mt-1">ATS Score: {cv.ats_score}%</div>
                    )}
                  </div>
                  <button
                    onClick={() => apiClient.downloadCV(cv.id)}
                    className="px-3 py-1 bg-[#15be53] hover:bg-[#0d9e42] text-white rounded transition text-sm"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload History */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light">Resumes</h2>
            <Link href="/upload" className="text-sm text-[#533afd] hover:text-[#4128c9]">+ Upload New</Link>
          </div>
          {resumes.length === 0 ? (
            <p className="text-[#64748d]">No resumes uploaded</p>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-4 bg-white rounded-xl border border-[#e5edf5]">
                  <div className="font-medium text-[#061b31]">{resume.original_filename}</div>
                  <div className="text-[#64748d] text-sm">
                    Skills: {resume.skills?.slice(0, 5).join(', ') || 'None detected'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
