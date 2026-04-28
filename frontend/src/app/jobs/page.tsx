'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Search } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1080px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-[#061b31]">Job Search</h1>
            <p className="text-[#64748d] text-sm mt-1">Discover jobs matched to your profile</p>
          </div>

          <div className="bg-white rounded-xl border border-[#e5edf5] p-12 text-center">
            <Search className="w-12 h-12 text-[#e5edf5] mx-auto mb-4" />
            <h2 className="text-lg text-[#061b31] mb-2">Coming Soon</h2>
            <p className="text-[#64748d] text-sm max-w-md mx-auto">
              AI-powered job scanning across LinkedIn, Indeed, and 50+ portals is under development.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
