import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          <div className="w-48 h-6 bg-white/[0.06] rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[1,2,3].map(i => (
              <div key={i} className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
                <div className="w-8 h-4 bg-white/[0.06] rounded mb-2 animate-pulse" />
                <div className="w-12 h-6 bg-white/[0.06] rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06] animate-pulse h-64" />
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06] animate-pulse h-64" />
          </div>
        </div>
      </main>
    </div>
  );
}
