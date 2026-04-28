'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { FileText, FilePlus, Mic, ArrowRight, Download } from 'lucide-react'

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
      <div className="min-h-screen bg-[#f6f9fc]">
        <Sidebar />
        <main className="lg:ml-[260px] min-h-screen flex items-center justify-center">
          <p className="text-[#64748d]">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <Sidebar />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1080px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-light text-[#061b31]">Dashboard</h1>
              {user && (
                <p className="text-[#64748d] text-sm mt-1">Welcome back, {user.name || user.email}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-white rounded-xl border border-[#e5edf5]">
              <div className="text-3xl font-light text-[#061b31]">{resumes.length}</div>
              <div className="text-[#64748d] text-sm mt-1">Resumes</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#e5edf5]">
              <div className="text-3xl font-light text-[#061b31]">{cvs.length}</div>
              <div className="text-[#64748d] text-sm mt-1">CVs Generated</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#e5edf5]">
              <div className="text-3xl font-light text-[#533afd]">{user?.jobs_remaining ?? '—'}</div>
              <div className="text-[#64748d] text-sm mt-1">Jobs Remaining</div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-[#e5edf5]">
              <div className="text-3xl font-light text-[#15be53]">0</div>
              <div className="text-[#64748d] text-sm mt-1">Applications</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/upload"
              className="group p-5 bg-white rounded-xl border border-[#e5edf5] hover:border-[#533afd] hover:shadow-[0_15px_35px_rgba(23,23,23,0.08)] transition"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] flex items-center justify-center mb-3 group-hover:bg-[rgba(83,58,253,0.08)] transition">
                <FileText className="w-5 h-5 text-[#533afd]" />
              </div>
              <h3 className="text-[#061b31] font-medium mb-1">Upload Resume</h3>
              <p className="text-[#64748d] text-sm">Get AI feedback instantly</p>
            </Link>

            <Link
              href="/generate"
              className="group p-5 bg-white rounded-xl border border-[#e5edf5] hover:border-[#533afd] hover:shadow-[0_15px_35px_rgba(23,23,23,0.08)] transition"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] flex items-center justify-center mb-3 group-hover:bg-[rgba(83,58,253,0.08)] transition">
                <FilePlus className="w-5 h-5 text-[#533afd]" />
              </div>
              <h3 className="text-[#061b31] font-medium mb-1">Generate CV</h3>
              <p className="text-[#64748d] text-sm">Tailored to any job posting</p>
            </Link>

            <Link
              href="/interview"
              className="group p-5 bg-white rounded-xl border border-[#e5edf5] hover:border-[#533afd] hover:shadow-[0_15px_35px_rgba(23,23,23,0.08)] transition"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] flex items-center justify-center mb-3 group-hover:bg-[rgba(83,58,253,0.08)] transition">
                <Mic className="w-5 h-5 text-[#533afd]" />
              </div>
              <h3 className="text-[#061b31] font-medium mb-1">Practice Interview</h3>
              <p className="text-[#64748d] text-sm">AI-generated Q&amp;A for your role</p>
            </Link>
          </div>

          {/* CVs Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-[#061b31]">Your CVs</h2>
              <Link href="/generate" className="text-sm text-[#533afd] hover:text-[#4128c9] flex items-center gap-1">
                + Generate New <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {cvs.length === 0 ? (
              <div className="p-8 bg-white rounded-xl text-center border border-[#e5edf5]">
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
                  <div
                    key={cv.id}
                    className="p-4 bg-white rounded-xl border border-[#e5edf5] flex justify-between items-center hover:shadow-[0_10px_20px_-10px_rgba(50,50,93,0.1)] transition"
                  >
                    <div>
                      <div className="font-medium text-[#061b31]">{cv.job_title}</div>
                      <div className="text-[#64748d] text-sm">{cv.company}</div>
                      {cv.ats_score && (
                        <div className="text-xs text-[#15be53] mt-1">ATS Score: {cv.ats_score}%</div>
                      )}
                    </div>
                    <button
                      onClick={() => apiClient.downloadCV(cv.id)}
                      className="px-3 py-1.5 bg-[#15be53] hover:bg-[#0d9e42] text-white rounded transition text-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumes Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-light text-[#061b31]">Resumes</h2>
              <Link href="/upload" className="text-sm text-[#533afd] hover:text-[#4128c9] flex items-center gap-1">
                + Upload New <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
    </div>
  )
}
