import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
        <span className="text-sm text-[#8A8F98]">Loading...</span>
      </div>
    </div>
  );
}
