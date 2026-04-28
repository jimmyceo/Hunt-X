'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient, getAuthToken } from '@/lib/api'

interface Resume {
  id: string
  original_filename: string
  skills: string[]
  seniority_level?: string
}

interface Evaluation {
  id: string
  company: string
  role: string
  global_score: number
  recommendation: string
  block_a: {
    archetype: string
    domain: string
    seniority: string
  }
  block_b: {
    matches: { requirement: string; cv_evidence: string; strength: number; must_have: boolean }[]
    gaps: { skill: string; is_blocker: boolean; mitigation: string }[]
  }
}

interface CVResult {
  id: string
  html_content: string
  ats_score: number
  keyword_matches: number
  job_title: string
  company: string
}

export default function GeneratePage() {
  const [step, setStep] = useState(1)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [generating, setGenerating] = useState(false)
  const [cv, setCv] = useState<CVResult | null>(null)
  const [error, setError] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      const data = await apiClient.listResumes()
      if (Array.isArray(data)) {
        setResumes(data)
      }
    } catch (err: any) {
      console.error('Failed to load resumes:', err)
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleEvaluate = async () => {
    setError('')
    setEvaluating(true)
    try {
      const data = await apiClient.createEvaluation(
        selectedResumeId,
        jobDescription,
        company,
        jobTitle,
        jobUrl || undefined
      )
      if (data.id) {
        setEvaluation(data)
        setStep(3)
      } else {
        setError(data.message || 'Evaluation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed')
    } finally {
      setEvaluating(false)
    }
  }

  const handleGenerate = async () => {
    if (!evaluation) return
    setError('')
    setGenerating(true)
    try {
      const data = await apiClient.generateCV(evaluation.id)
      if (data.id) {
        setCv(data)
        setStep(4)
      } else {
        setError(data.message || 'Generation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (cv?.id) {
      apiClient.downloadCV(cv.id)
    }
  }

  const canProceedStep1 = selectedResumeId && jobTitle.trim() && company.trim()
  const canProceedStep2 = jobDescription.trim().length > 50

  return (
    <main className="min-h-screen bg-white text-[#061b31] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light">Generate Tailored CV</h1>
            <p className="text-[#64748d] text-sm mt-1">Step {step} of 4</p>
          </div>
          <Link
            href="/dashboard"
            className="text-[#533afd] hover:text-[#4128c9] text-sm transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition ${
                s <= step ? 'bg-[#533afd]' : 'bg-[#e5edf5]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Select Resume + Job Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-[#e5edf5] p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Select Resume</label>
              {loadingResumes ? (
                <p className="text-[#64748d] text-sm">Loading resumes...</p>
              ) : resumes.length === 0 ? (
                <div className="p-4 bg-[#f6f9fc] rounded-lg border border-[#e5edf5]">
                  <p className="text-[#64748d] text-sm mb-2">No resumes found. Upload one first.</p>
                  <Link
                    href="/upload"
                    className="inline-block px-4 py-2 bg-[#533afd] text-white rounded-lg text-sm transition"
                  >
                    Upload Resume
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                >
                  <option value="">Choose a resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.original_filename} {r.seniority_level ? `(${r.seniority_level})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 px-4 bg-[#533afd] hover:bg-[#4128c9] disabled:opacity-50 text-white rounded-lg font-medium transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Job Description */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-[#e5edf5] p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={10}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition resize-y"
              />
              <p className="text-xs text-[#64748d] mt-1">Minimum 50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Job URL (optional)</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 border border-[#e5edf5] hover:border-[#533afd] rounded-lg font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleEvaluate}
                disabled={!canProceedStep2 || evaluating}
                className="flex-1 py-3 px-4 bg-[#533afd] hover:bg-[#4128c9] disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {evaluating ? 'Evaluating Fit...' : 'Evaluate Fit'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Evaluation Results */}
        {step === 3 && evaluation && (
          <div className="space-y-6">
            {/* Match Score */}
            <div className="bg-white rounded-xl border border-[#e5edf5] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light">Fit Analysis</h2>
                <div className="text-right">
                  <div className="text-3xl font-light text-[#15be53]">{Math.round(evaluation.global_score * 20)}%</div>
                  <div className="text-sm text-[#64748d]">Match Score</div>
                </div>
              </div>

              <div className="p-4 bg-[#f6f9fc] rounded-lg mb-4">
                <p className="text-[#061b31] font-medium mb-1">Recommendation</p>
                <p className="text-[#64748d] text-sm">{evaluation.recommendation}</p>
              </div>

              {evaluation.block_a && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg border border-[#e5edf5]">
                    <p className="text-xs text-[#64748d]">Archetype</p>
                    <p className="text-sm font-medium text-[#061b31]">{evaluation.block_a.archetype || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e5edf5]">
                    <p className="text-xs text-[#64748d]">Domain</p>
                    <p className="text-sm font-medium text-[#061b31]">{evaluation.block_a.domain || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e5edf5]">
                    <p className="text-xs text-[#64748d]">Seniority</p>
                    <p className="text-sm font-medium text-[#061b31]">{evaluation.block_a.seniority || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Matches */}
              {evaluation.block_b?.matches?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[#061b31] mb-2">Strong Matches</h3>
                  <div className="space-y-2">
                    {evaluation.block_b.matches.slice(0, 5).map((m, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-[#15be53]/5 rounded-lg">
                        <span className="text-[#15be53] mt-0.5">✓</span>
                        <div>
                          <p className="text-sm text-[#061b31]">{m.requirement}</p>
                          <p className="text-xs text-[#64748d]">{m.cv_evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {evaluation.block_b?.gaps?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[#061b31] mb-2">Improvement Areas</h3>
                  <div className="space-y-2">
                    {evaluation.block_b.gaps.slice(0, 5).map((g, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-amber-500/5 rounded-lg">
                        <div>
                          <p className="text-sm text-[#061b31]">{g.skill} {g.is_blocker && <span className="text-[#ea2261] text-xs">(blocker)</span>}</p>
                          <p className="text-xs text-[#64748d]">{g.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 border border-[#e5edf5] hover:border-[#533afd] rounded-lg font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-3 px-4 bg-[#533afd] hover:bg-[#4128c9] disabled:opacity-50 text-white rounded-lg font-medium transition"
                >
                  {generating ? 'Generating CV...' : 'Generate Tailored CV'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: CV Result */}
        {step === 4 && cv && (
          <div className="space-y-6">
            <div className="p-6 bg-[#15be53]/10 border border-[#15be53]/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#15be53] font-medium">✓ CV Generated Successfully!</p>
                  <p className="text-sm text-[#64748d]">{cv.job_title} at {cv.company}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-light text-[#15be53]">{cv.ats_score}%</div>
                  <div className="text-xs text-[#64748d]">ATS Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e5edf5] p-6">
              <h3 className="font-medium mb-4 text-[#061b31]">Preview:</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: cv.html_content }}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-4 bg-[#15be53] hover:bg-[#0d9e42] text-white rounded-lg font-medium transition"
              >
                Download PDF
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setEvaluation(null)
                  setCv(null)
                  setJobDescription('')
                  setJobUrl('')
                }}
                className="flex-1 py-3 px-4 border border-[#e5edf5] hover:border-[#533afd] rounded-lg font-medium transition"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
