'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1A24] rounded-lg p-8 border border-white/[0.06]">
          <Link href="/auth" className="inline-flex items-center gap-1 text-sm text-[#8A8F98] hover:text-[#E8E8ED] transition-colors duration-150 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-[#00D26A] mx-auto mb-4" />
              <h2 className="text-xl font-medium text-[#E8E8ED] mb-2">Check your email</h2>
              <p className="text-[#8A8F98] text-sm mb-6">
                If an account exists for <strong className="text-[#E8E8ED]">{email}</strong>, you will receive a password reset link.
              </p>
              <Link href="/auth" className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium text-[#E8E8ED] mb-2">Reset Password</h2>
              <p className="text-[#8A8F98] text-sm mb-6">
                Enter your email address and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
