'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function InterviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Interview error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#EF4444]/[0.12] border border-[#EF4444]/[0.25] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
        </div>
        <h1 className="text-xl font-medium text-[#E8E8ED] mb-2">Interview Prep Error</h1>
        <p className="text-sm text-[#8A8F98] mb-6">{error.message || 'Failed to load interview prep. Please try again.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.98]">
            <RotateCcw className="w-4 h-4" />Try Again
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.10] text-[#E8E8ED] rounded-md text-sm font-medium transition-all duration-150">
            <Home className="w-4 h-4" />Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
