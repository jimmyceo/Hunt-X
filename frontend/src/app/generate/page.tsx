'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { ArrowRight, ArrowLeft, Download, RotateCcw, Sparkles, Check, AlertTriangle } from 'lucide-react'

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

  const matchScore = evaluation ? Math.round(evaluation.global_score * 20) : 0

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Generate Tailored CV</h1>
              <p className="text-[#8A8F98] text-sm mt-1">Step {step} of 4</p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#3B82F6]' : 'bg-white/[0.06]'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Select Resume + Job Details */}
          {step === 1 && (
            <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Select Resume</label>
                {loadingResumes ? (
                  <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                    <div className="w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
                    Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 bg-[#12121A] rounded-md border border-white/[0.06]">
                    <p className="text-[#8A8F98] text-sm mb-3">No resumes found. Upload one first.</p>
                    <Link
                      href="/upload"
                      className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150"
                    >
                      Upload Resume
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                  >
                    <option value="" className="bg-[#1A1A24]">Choose a resume...</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#1A1A24]">
                        {r.original_filename} {r.seniority_level ? `(${r.seniority_level})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 disabled:hover:bg-[#3B82F6] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Job Description */}
          {step === 2 && (
            <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 resize-y"
                />
                <p className="text-xs text-[#5A5E66] mt-1">Minimum 50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Job URL (optional)</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-white/[0.10] hover:border-white/[0.14] hover:bg-white/[0.04] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={!canProceedStep2 || evaluating}
                  className="flex-1 py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 disabled:hover:bg-[#3B82F6] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {evaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Evaluating Fit...
                    </>
                  ) : (
                    <>
                      Evaluate Fit
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Evaluation Results */}
          {step === 3 && evaluation && (
            <div className="space-y-6">
              <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-[#E8E8ED]">Fit Analysis</h2>
                  <div className="text-right">
                    <div className="text-3xl font-medium text-[#00D26A]">{matchScore}%</div>
                    <div className="text-sm text-[#8A8F98]">Match Score</div>
                  </div>
                </div>

                <div className="p-4 bg-[#12121A] rounded-md border border-white/[0.06] mb-4">
                  <p className="text-[#E8E8ED] font-medium mb-1">Recommendation</p>
                  <p className="text-[#8A8F98] text-sm">{evaluation.recommendation}</p>
                </div>

                {evaluation.block_a && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                      <p className="text-xs text-[#5A5E66] mb-1">Archetype</p>
                      <p className="text-sm font-medium text-[#E8E8ED]">{evaluation.block_a.archetype || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                      <p className="text-xs text-[#5A5E66] mb-1">Domain</p>
                      <p className="text-sm font-medium text-[#E8E8ED]">{evaluation.block_a.domain || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                      <p className="text-xs text-[#5A5E66] mb-1">Seniority</p>
                      <p className="text-sm font-medium text-[#E8E8ED]">{evaluation.block_a.seniority || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {evaluation.block_b?.matches?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-[#E8E8ED] mb-2">Strong Matches</h3>
                    <div className="space-y-2">
                      {evaluation.block_b.matches.slice(0, 5).map((m, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-[#00D26A]/[0.06] rounded-md border border-[#00D26A]/[0.15]">
                          <Check className="w-4 h-4 text-[#00D26A] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-[#E8E8ED]">{m.requirement}</p>
                            <p className="text-xs text-[#8A8F98]">{m.cv_evidence}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evaluation.block_b?.gaps?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-[#E8E8ED] mb-2">Improvement Areas</h3>
                    <div className="space-y-2">
                      {evaluation.block_b.gaps.slice(0, 5).map((g, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-[#F59E0B]/[0.06] rounded-md border border-[#F59E0B]/[0.15]">
                          <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-[#E8E8ED]">{g.skill} {g.is_blocker && <span className="text-[#EF4444] text-xs">(blocker)</span>}</p>
                            <p className="text-xs text-[#8A8F98]">{g.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 px-4 border border-white/[0.10] hover:border-white/[0.14] hover:bg-white/[0.04] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1 py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 disabled:hover:bg-[#3B82F6] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating CV...
                      </>
                    ) : (
                      <>
                        Generate Tailored CV
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: CV Result */}
          {step === 4 && cv && (
            <div className="space-y-6">
              <div className="p-6 bg-[#00D26A]/[0.08] border border-[#00D26A]/[0.25] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-[#00D26A]" />
                      <p className="text-[#00D26A] font-medium">CV Generated Successfully!</p>
                    </div>
                    <p className="text-sm text-[#8A8F98] ml-7">{cv.job_title} at {cv.company}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-[#00D26A]">{cv.ats_score}%</div>
                    <div className="text-xs text-[#8A8F98]">ATS Score</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                <h3 className="font-medium mb-4 text-[#E8E8ED]">Preview:</h3>
                <div
                  className="prose max-w-none prose-invert"
                  dangerouslySetInnerHTML={{ __html: cv.html_content }}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 bg-[#00D26A]/[0.12] hover:bg-[#00D26A]/[0.2] text-[#00D26A] border border-[#00D26A]/[0.25] rounded-md font-medium transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => {
                    setStep(1)
                    setEvaluation(null)
                    setCv(null)
                    setJobDescription('')
                    setJobUrl('')
                  }}
                  className="flex-1 py-3 px-4 border border-white/[0.10] hover:border-white/[0.14] hover:bg-white/[0.04] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
