'use client'

import { useState } from 'react'

export default function GeneratePage() {
  const [step, setStep] = useState(1)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    setGenerating(true)
    // TODO: Call API
    setTimeout(() => {
      setResult({
        cv_html: '<h1>Generated CV will appear here</h1>'
      })
      setGenerating(false)
      setStep(3)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Generate Tailored CV</h1>

        {/* Step 1: Job Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!jobTitle || !company}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 rounded-lg font-semibold transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Job Description */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={10}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!jobDescription || generating}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 rounded-lg font-semibold transition"
              >
                {generating ? 'Generating...' : 'Generate CV'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <div className="space-y-4">
            <div className="p-6 bg-emerald-500/20 border border-emerald-500 rounded-xl">
              <p className="text-emerald-400 font-semibold">✓ CV Generated Successfully!</p>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-xl">
              <h3 className="font-semibold mb-4">Preview:</h3>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result.cv_html }}
              />
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition">
                Download PDF
              </button>
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold transition"
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