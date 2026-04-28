'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Kanban } from 'lucide-react';

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1080px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-[#061b31]">Application Tracker</h1>
            <p className="text-[#64748d] text-sm mt-1">Track every application from applied to offer</p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5edf5] p-12 text-center">
            <Kanban className="w-12 h-12 text-[#e5edf5] mx-auto mb-4" />
            <h2 className="text-lg text-[#061b31] mb-2">Coming Soon</h2>
            <p className="text-[#64748d] text-sm max-w-md mx-auto">
              Visual pipeline to track your job applications from applied to offer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
