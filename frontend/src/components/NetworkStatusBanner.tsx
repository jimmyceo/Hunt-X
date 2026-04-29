'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export default function NetworkStatusBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#EF4444]/[0.12] border-b border-[#EF4444]/[0.25] px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm text-[#EF4444]">
        <WifiOff className="w-4 h-4" />
        <span>You are offline. Some features may not work until your connection is restored.</span>
      </div>
    </div>
  );
}
