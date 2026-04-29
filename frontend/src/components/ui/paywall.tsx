'use client';

import { ReactNode, useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/lib/subscription-context';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentTier: string;
  requiredTier: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  currentTier,
  requiredTier
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
      />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 animate-scale-in">
        <div className="bg-[#1A1A24] border border-white/[0.06] rounded-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[#5A5E66] hover:text-[#E8E8ED] transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00D26A] rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl font-medium text-center mb-2 text-[#E8E8ED]">
            Upgrade to Unlock {feature}
          </h2>
          <p className="text-[#8A8F98] text-center text-sm mb-6">
            You are currently on the {currentTier} plan.
            {feature} is available on {requiredTier} and above.
          </p>

          <div className="bg-[#12121A] rounded-md border border-white/[0.06] p-4 mb-6">
            <h3 className="text-sm font-medium mb-3 text-[#E8E8ED]">What you will get:</h3>
            <ul className="space-y-2 text-sm text-[#8A8F98]">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00D26A] rounded-full" />
                {feature} with AI
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00D26A] rounded-full" />
                Priority processing
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00D26A] rounded-full" />
                No watermarks
              </li>
            </ul>
          </div>

          <a
            href="/pricing"
            className="block w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white font-medium rounded-md transition-all duration-150 text-center hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
          >
            Upgrade Now
          </a>

          <p className="text-center text-xs text-[#5A5E66] mt-4">
            14-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </>
  );
}

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  tier?: string;
}

export function FeatureGate({ children, feature, fallback, tier = 'pro' }: FeatureGateProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const { usage, isLoading } = useSubscription();

  const featureData = usage?.features?.find((f) => f.feature === feature);
  const hasAccess = featureData ? (featureData.unlimited || featureData.remaining > 0) : false;
  const currentTier = usage?.tier || 'free';

  if (isLoading) {
    return <div className="animate-pulse bg-[#1A1A24] rounded-lg h-32 border border-white/[0.06]"></div>;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        <div className={cn('blur-sm select-none pointer-events-none')}>{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowPaywall(true)}
            className="px-4 py-2 bg-[#1A1A24] hover:bg-[#22222E] border border-white/[0.10] text-[#E8E8ED] text-sm font-medium rounded-md transition-all duration-150 flex items-center gap-2 hover:shadow-[0_0_16px_rgba(59,130,246,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-[#60A5FA]" />
            Upgrade to {tier}
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
        currentTier={currentTier}
        requiredTier={tier}
      />
    </>
  );
}
