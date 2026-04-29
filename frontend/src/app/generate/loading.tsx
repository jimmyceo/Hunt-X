import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          <div className="w-48 h-6 bg-white/[0.06] rounded animate-pulse mb-6" />
          <div className="p-6 bg-[#1A1A24] rounded-lg border border-white/[0.06] animate-pulse h-96" />
        </div>
      </main>
    </div>
  );
}
