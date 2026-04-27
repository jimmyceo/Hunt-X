'use client';

import { useState } from 'react';
import {
  Zap,
  CreditCard,
  AlertCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface Credit {
  feature: string;
  display_name: string;
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
  reset_date?: string;
}

interface CreditIndicatorProps {
  credits: Credit[];
  tier: string;
  planName: string;
}

export function CreditIndicator({ credits, tier, planName }: CreditIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryCredit = credits.find(c => c.feature === 'cv.generate') || credits[0];
  const isLow = primaryCredit && !primaryCredit.unlimited && primaryCredit.remaining <= 2;
  const isEmpty = primaryCredit && !primaryCredit.unlimited && primaryCredit.remaining === 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
          isEmpty
            ? 'bg-red-500/20 border border-red-500/30'
            : isLow
            ? 'bg-amber-500/20 border border-amber-500/30'
            : tier === 'pro'
            ? 'bg-gradient-to-r from-[#533afd]/20 to-[#15be53]/20 border border-[#533afd]/30'
            : 'bg-[#f6f9fc] border border-[#e5edf5]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {primaryCredit?.unlimited ? (
            <>
              <Zap className="w-3.5 h-3.5 text-[#15be53]" />
              <span className="text-xs font-medium text-[#15be53]">Unlimited</span>
            </>
          ) : (
            <>
              <CreditCard className={`w-3.5 h-3.5 ${isLow ? 'text-amber-500' : 'text-[#64748d]'}`} />
              <span className={`text-xs font-medium ${isLow ? 'text-amber-500' : 'text-[#061b31]'}`}>
                {primaryCredit?.remaining} left
              </span>
            </>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#64748d] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#e5edf5] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-[#e5edf5] flex items-center justify-between">
            <div>
              <span className="text-sm font-normal text-[#061b31]">{planName}</span>
              <span className="text-xs text-[#64748d] ml-2">Plan</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tier === 'pro'
                ? 'bg-[#533afd]/20 text-[#533afd]'
                : 'bg-[#f6f9fc] text-[#64748d]'
            }`}>
              {tier}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {credits.map((credit) => (
              <div key={credit.feature} className="flex items-center justify-between">
                <span className="text-sm text-[#64748d]">{credit.display_name}</span>
                <div className="flex items-center gap-2">
                  {credit.unlimited ? (
                    <span className="text-xs text-[#15be53] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Unlimited
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-[#f6f9fc] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            credit.remaining / credit.total <= 0.2
                              ? 'bg-[#ea2261]'
                              : credit.remaining / credit.total <= 0.5
                              ? 'bg-amber-500'
                              : 'bg-[#15be53]'
                          }`}
                          style={{ width: `${(credit.remaining / credit.total) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${
                        credit.remaining / credit.total <= 0.2 ? 'text-[#ea2261]' : 'text-[#64748d]'
                      }`}>
                        {credit.remaining}/{credit.total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isLow && (
            <div className="px-4 py-3 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-600">Running low on credits</p>
                  <a href="/pricing" className="text-xs text-amber-600/80 hover:text-amber-600 underline">
                    Upgrade for more
                  </a>
                </div>
              </div>
            </div>
          )}

          {tier !== 'pro' && tier !== 'team' && (
            <div className="p-4 border-t border-[#e5edf5]">
              <a
                href="/pricing"
                className="block w-full py-2 text-center text-sm font-normal bg-[#533afd] hover:bg-[#4338ca] text-white rounded-lg transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CreditBar({ credits }: { credits: Credit[] }) {
  return (
    <div className="bg-white border border-[#e5edf5] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#533afd] to-[#15be53] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-normal text-[#061b31]">Your Credits</h3>
          <p className="text-sm text-[#64748d]">Track your monthly usage</p>
        </div>
      </div>

      <div className="space-y-4">
        {credits.map((credit) => (
          <div key={credit.feature} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#061b31]">{credit.display_name}</span>
              {credit.unlimited ? (
                <span className="text-sm text-[#15be53] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Unlimited
                </span>
              ) : (
                <span className={`text-sm ${
                  credit.remaining / credit.total <= 0.2 ? 'text-[#ea2261]' : 'text-[#64748d]'
                }`}>
                  {credit.remaining} of {credit.total} remaining
                </span>
              )}
            </div>

            {!credit.unlimited && (
              <div className="w-full h-2 bg-[#f6f9fc] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    credit.remaining / credit.total <= 0.2
                      ? 'bg-[#ea2261]'
                      : credit.remaining / credit.total <= 0.5
                      ? 'bg-amber-500'
                      : 'bg-[#15be53]'
                  }`}
                  style={{ width: `${(credit.used / credit.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
