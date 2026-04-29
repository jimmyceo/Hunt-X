'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Loader2, Mail, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function VerifyPage() {
  const router = useRouter()
  const params = useSearchParams()
  const codeFromUrl = params.get('code') || ''

  const [code, setCode] = useState(codeFromUrl)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (codeFromUrl) {
      handleVerify(codeFromUrl)
    }
  }, [codeFromUrl])

  const handleVerify = async (verificationCode: string) => {
    if (!verificationCode.trim()) return
    setLoading(true)
    setStatus('idle')
    try {
      const data = await apiClient.verifyEmail(verificationCode)
      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully')
        setTimeout(() => router.push('/upload'), 1500)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify(code)
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const data = await apiClient.resendVerification()
      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Verification email resent')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0B0B0F]">
      <div className="hidden lg:flex lg:w-[45%] bg-[#12121A] relative flex-col justify-between p-12 text-white overflow-hidden border-r border-white/[0.06]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6] rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-medium tracking-tight text-[#E8E8ED]">
            Hunt-X
          </Link>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-5xl font-medium tracking-tight mb-4 text-[#E8E8ED]" style={{ letterSpacing: '-0.96px', lineHeight: 1.0 }}>
            Verify Email.
          </h2>
          <p className="text-lg text-[#8A8F98]">
            One step closer to your AI career agent.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-medium tracking-tight text-[#E8E8ED]">
              Hunt-X
            </Link>
          </div>

          <div className="bg-[#1A1A24] rounded-lg p-8 border border-white/[0.06]">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#3B82F6]" />
              </div>
            </div>

            <h1 className="text-xl font-medium text-[#E8E8ED] text-center mb-2">
              Verify your email
            </h1>
            <p className="text-sm text-[#8A8F98] text-center mb-6">
              Enter the 8-digit code sent to your email.
            </p>

            {status === 'success' && (
              <div className="mb-4 p-4 rounded-md bg-[#00D26A]/10 border border-[#00D26A]/20 text-[#00D26A] text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="mb-4 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="XXXXXXXX"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 text-center text-lg tracking-[0.25em] font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 8}
                className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-[#5A5E66] hover:text-[#8A8F98] transition-colors duration-150 disabled:opacity-50"
              >
                {resending ? 'Sending...' : "Didn't receive it? Resend code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
