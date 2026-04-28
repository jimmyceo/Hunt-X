'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

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

  const { getRootProps, getInputProps } = useDropzone({
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
    <main className="min-h-screen bg-white text-[#061b31] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Upload Your Resume</h1>
          <Link
            href="/dashboard"
            className="text-[#533afd] hover:text-[#4128c9] text-sm transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {!result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#e5edf5] p-6">
              <label className="block text-sm font-medium text-[#061b31] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                required
              />
            </div>

            <div
              {...getRootProps()}
              className="border-2 border-dashed border-[#e5edf5] rounded-xl p-12 text-center hover:border-[#533afd] transition cursor-pointer bg-[#f6f9fc]"
            >
              <input {...getInputProps()} />
              {uploading ? (
                <p className="text-[#533afd]">Analyzing with AI...</p>
              ) : (
                <>
                  <p className="text-lg mb-2 text-[#061b31]">Drop your resume here</p>
                  <p className="text-[#64748d] text-sm">PDF, DOC, DOCX, or TXT</p>
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="p-6 bg-[#15be53]/10 border border-[#15be53]/20 rounded-xl">
              <p className="text-[#15be53] font-medium">✓ Resume Uploaded Successfully!</p>
              <p className="text-sm text-[#64748d] mt-1">{result.original_filename}</p>
            </div>

            {result.skills && result.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e5edf5] p-6">
                <h2 className="text-xl font-light mb-4">Detected Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-[#f6f9fc] rounded-full text-sm text-[#061b31] border border-[#e5edf5]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href="/generate"
                className="flex-1 py-3 px-4 bg-[#533afd] hover:bg-[#4128c9] text-white rounded-lg font-medium text-center transition"
              >
                Generate Tailored CV
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 border border-[#e5edf5] hover:border-[#533afd] rounded-lg font-medium text-center transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
