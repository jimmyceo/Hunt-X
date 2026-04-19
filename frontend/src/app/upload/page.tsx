'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/analyze-resume', formData)
      setAnalysis(res.data)
    } catch (err) {
      alert('Upload failed. Try again.')
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
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Your Resume</h1>
        
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-slate-500 rounded-xl p-12 text-center hover:border-blue-500 transition cursor-pointer"
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p className="text-blue-400">Analyzing with AI...</p>
          ) : (
            <>
              <p className="text-lg mb-2">Drop your resume here</p>
              <p className="text-slate-400 text-sm">PDF, DOC, DOCX, or TXT</p>
            </>
          )}
        </div>

        {analysis && (
          <div className="mt-8 p-6 bg-slate-800 rounded-xl">
            <h2 className="text-xl font-bold mb-4">AI Analysis</h2>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{JSON.stringify(analysis, null, 2)}</pre>
            
            <a 
              href="/dashboard"
              className="block mt-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-center transition"
            >
              Continue to Dashboard
            </a>
          </div>
        )}
      </div>
    </main>
  )
}