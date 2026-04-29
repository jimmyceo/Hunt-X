import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          <div className="w-48 h-6 bg-white/[0.06] rounded animate-pulse mb-6" />
          <div className="flex gap-2 mb-6">
            <div className="w-20 h-8 bg-white/[0.06] rounded animate-pulse" />
            <div className="w-20 h-8 bg-white/[0.06] rounded animate-pulse" />
            <div className="w-20 h-8 bg-white/[0.06] rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06] animate-pulse">
                <div className="w-40 h-4 bg-white/[0.06] rounded mb-2" />
                <div className="w-24 h-3 bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
