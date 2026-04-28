'use client';

import Sidebar from '@/components/layout/Sidebar';
import { MessagesSquare } from 'lucide-react';

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1080px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-[#061b31]">Interview Prep</h1>
            <p className="text-[#64748d] text-sm mt-1">STAR stories, red flags, and practice questions</p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5edf5] p-12 text-center">
            <MessagesSquare className="w-12 h-12 text-[#e5edf5] mx-auto mb-4" />
            <h2 className="text-lg text-[#061b31] mb-2">Coming Soon</h2>
            <p className="text-[#64748d] text-sm max-w-md mx-auto">
              AI-generated interview preparation including STAR stories, red flag answers, and questions to ask.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
