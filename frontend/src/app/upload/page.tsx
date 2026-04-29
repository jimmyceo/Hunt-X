'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { ArrowRight, Upload, FileText, Check } from 'lucide-react'

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ id: string; original_filename: string; skills: string[] } | null>(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    apiClient.getCurrentUser().then((u) => {
      if (u?.email) {
        setEmail(u.email)
        setUser(u)
      }
    }).catch(() => {})
  }, [])

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (!email) {
      setError('Please enter your email first')
      return
    }

    setError('')
    setUploading(true)

    try {
      const data = await apiClient.uploadResume(file, email)
      if (data.id) {
        setResult(data)
      } else {
        setError('Upload returned unexpected response')
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  })

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Upload Your Resume</h1>
              <p className="text-[#8A8F98] text-sm mt-1">Let the AI agent analyze your profile</p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!result && (
            <div className="space-y-6">
              <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                  required
                />
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-150 cursor-pointer ${
                  isDragActive
                    ? 'border-[#3B82F6] bg-[#3B82F6]/[0.05]'
                    : 'border-white/[0.08] hover:border-white/[0.14] bg-[#1A1A24]'
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
                    <p className="text-[#60A5FA] font-medium">Analyzing with AI...</p>
                    <div className="w-full max-w-xs h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full animate-shimmer" style={{ width: '60%' }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-[#60A5FA]" />
                    </div>
                    <p className="text-lg text-[#E8E8ED] mb-2 font-medium">Drop your resume here</p>
                    <p className="text-[#8A8F98] text-sm">PDF, DOC, DOCX, or TXT</p>
                  </>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div className="p-6 bg-[#00D26A]/[0.08] border border-[#00D26A]/[0.25] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-[#00D26A]" />
                  <p className="text-[#00D26A] font-medium">Resume Uploaded Successfully!</p>
                </div>
                <p className="text-sm text-[#8A8F98] ml-7">{result.original_filename}</p>
              </div>

              {result.skills && result.skills.length > 0 && (
                <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                  <h2 className="text-lg font-medium text-[#E8E8ED] mb-4">Detected Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-[#3B82F6]/[0.12] rounded-full text-sm text-[#60A5FA] border border-[#3B82F6]/[0.25]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href="/generate"
                  className="flex-1 py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium text-center transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
                >
                  Generate Tailored CV
                </Link>
                <Link
                  href="/dashboard"
                  className="flex-1 py-3 px-4 border border-white/[0.10] hover:border-white/[0.14] hover:bg-white/[0.04] text-[#E8E8ED] rounded-md font-medium text-center transition-all duration-150"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
