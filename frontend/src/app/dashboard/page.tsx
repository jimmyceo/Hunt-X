'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { FileText, FilePlus, Mic, ArrowRight, Download, Sparkles } from 'lucide-react'

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
      <div className="min-h-screen bg-[#0B0B0F]">
        <Sidebar />
        <main className="lg:ml-[260px] min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#8A8F98]">
            <div className="w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Dashboard</h1>
              {user && (
                <p className="text-[#8A8F98] text-sm mt-1">Welcome back, {user.name || user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]" />
              </span>
              <span className="text-xs text-[#5A5E66] font-mono">AGENT ACTIVE</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-3xl font-medium text-[#E8E8ED]">{resumes.length}</div>
              <div className="text-[#5A5E66] text-sm mt-1">Resumes</div>
            </div>
            <div className="p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-3xl font-medium text-[#E8E8ED]">{cvs.length}</div>
              <div className="text-[#5A5E66] text-sm mt-1">CVs Generated</div>
            </div>
            <div className="p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-3xl font-medium text-[#3B82F6]">{user?.jobs_remaining ?? '—'}</div>
              <div className="text-[#5A5E66] text-sm mt-1">Jobs Remaining</div>
            </div>
            <div className="p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-3xl font-medium text-[#00D26A]">0</div>
              <div className="text-[#5A5E66] text-sm mt-1">Applications</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/upload"
              className="group p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06] hover:border-white/[0.10] hover:bg-[#22222E] transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center mb-3 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-all duration-150">
                <FileText className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <h3 className="text-[#E8E8ED] font-medium mb-1">Upload Resume</h3>
              <p className="text-[#8A8F98] text-sm">Get AI feedback instantly</p>
            </Link>

            <Link
              href="/generate"
              className="group p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06] hover:border-white/[0.10] hover:bg-[#22222E] transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center mb-3 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-all duration-150">
                <FilePlus className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <h3 className="text-[#E8E8ED] font-medium mb-1">Generate CV</h3>
              <p className="text-[#8A8F98] text-sm">Tailored to any job posting</p>
            </Link>

            <Link
              href="/interview"
              className="group p-5 bg-[#1A1A24] rounded-lg border border-white/[0.06] hover:border-white/[0.10] hover:bg-[#22222E] transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center mb-3 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-all duration-150">
                <Mic className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <h3 className="text-[#E8E8ED] font-medium mb-1">Practice Interview</h3>
              <p className="text-[#8A8F98] text-sm">AI-generated Q&A for your role</p>
            </Link>
          </div>

          {/* CVs Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-[#E8E8ED]">Your CVs</h2>
              <Link href="/generate" className="text-sm text-[#60A5FA] hover:text-[#3B82F6] flex items-center gap-1 transition-colors duration-150">
                + Generate New <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {cvs.length === 0 ? (
              <div className="p-8 bg-[#1A1A24] rounded-lg text-center border border-white/[0.06]">
                <Sparkles className="w-8 h-8 text-[#5A5E66] mx-auto mb-3" />
                <p className="text-[#8A8F98] mb-4">No CVs generated yet</p>
                <Link
                  href="/generate"
                  className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Generate Your First CV
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06] flex justify-between items-center hover:border-white/[0.10] transition-colors duration-150"
                  >
                    <div>
                      <div className="font-medium text-[#E8E8ED]">{cv.job_title}</div>
                      <div className="text-[#8A8F98] text-sm">{cv.company}</div>
                      {cv.ats_score && (
                        <div className="text-xs text-[#00D26A] mt-1">ATS Score: {cv.ats_score}%</div>
                      )}
                    </div>
                    <button
                      onClick={() => apiClient.downloadCV(cv.id)}
                      className="px-3 py-1.5 bg-[#00D26A]/[0.12] hover:bg-[#00D26A]/[0.2] text-[#00D26A] rounded-md transition-colors duration-150 text-sm flex items-center gap-1.5 border border-[#00D26A]/[0.25]"
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
              <h2 className="text-xl font-medium text-[#E8E8ED]">Resumes</h2>
              <Link href="/upload" className="text-sm text-[#60A5FA] hover:text-[#3B82F6] flex items-center gap-1 transition-colors duration-150">
                + Upload New <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {resumes.length === 0 ? (
              <p className="text-[#5A5E66]">No resumes uploaded</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
                    <div className="font-medium text-[#E8E8ED]">{resume.original_filename}</div>
                    <div className="text-[#8A8F98] text-sm">
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
