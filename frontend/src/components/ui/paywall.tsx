'use client';

import { ReactNode, useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
      />

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 animate-scale-in">
        <div className="bg-white border border-[#e5edf5] rounded-xl p-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-[#64748d] hover:text-[#061b31] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-gradient-to-br from-[#533afd] to-[#15be53] rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl font-normal text-center mb-2 text-[#061b31]">
            Upgrade to Unlock {feature}
          </h2>
          <p className="text-[#64748d] text-center text-sm mb-6">
            You are currently on the {currentTier} plan.
            {feature} is available on {requiredTier} and above.
          </p>

          <div className="bg-[#f6f9fc] rounded-xl p-4 mb-6">
            <h3 className="text-sm font-normal mb-2 text-[#061b31]">What you will get:</h3>
            <ul className="space-y-2 text-sm text-[#64748d]">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#15be53] rounded-full" />
                {feature} with AI
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#15be53] rounded-full" />
                Priority processing
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#15be53] rounded-full" />
                No watermarks
              </li>
            </ul>
          </div>

          <button className="w-full py-3 px-4 bg-[#533afd] hover:bg-[#4338ca] text-white font-normal rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group">
            Upgrade Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-[#64748d] mt-4">
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
  const hasAccess = false;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        <div className={cn('blur-sm select-none pointer-events-none')}>{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowPaywall(true)}
            className="px-4 py-2 bg-white hover:bg-[#f6f9fc] border border-[#e5edf5] text-[#061b31] text-sm font-normal rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#533afd]" />
            Upgrade to {tier}
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
        currentTier="free"
        requiredTier={tier}
      />
    </>
  );
}
