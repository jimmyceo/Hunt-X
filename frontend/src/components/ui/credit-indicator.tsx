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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 ${
          isEmpty
            ? 'bg-[#EF4444]/[0.12] border border-[#EF4444]/[0.25]'
            : isLow
            ? 'bg-[#F59E0B]/[0.12] border border-[#F59E0B]/[0.25]'
            : tier === 'pro'
            ? 'bg-gradient-to-r from-[#3B82F6]/[0.15] to-[#00D26A]/[0.15] border border-[#3B82F6]/[0.25]'
            : 'bg-[#1A1A24] border border-white/[0.06]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {primaryCredit?.unlimited ? (
            <>
              <Zap className="w-3.5 h-3.5 text-[#00D26A]" />
              <span className="text-xs font-medium text-[#00D26A]">Unlimited</span>
            </>
          ) : (
            <>
              <CreditCard className={`w-3.5 h-3.5 ${isLow ? 'text-[#F59E0B]' : 'text-[#5A5E66]'}`} />
              <span className={`text-xs font-medium ${isLow ? 'text-[#F59E0B]' : 'text-[#E8E8ED]'}`}>
                {primaryCredit?.remaining} left
              </span>
            </>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#5A5E66] transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#1A1A24] border border-white/[0.06] rounded-lg z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-[#E8E8ED]">{planName}</span>
              <span className="text-xs text-[#5A5E66] ml-2">Plan</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tier === 'pro'
                ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA]'
                : 'bg-[#12121A] text-[#5A5E66]'
            }`}>
              {tier}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {credits.map((credit) => (
              <div key={credit.feature} className="flex items-center justify-between">
                <span className="text-sm text-[#8A8F98]">{credit.display_name}</span>
                <div className="flex items-center gap-2">
                  {credit.unlimited ? (
                    <span className="text-xs text-[#00D26A] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Unlimited
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            credit.remaining / credit.total <= 0.2
                              ? 'bg-[#EF4444]'
                              : credit.remaining / credit.total <= 0.5
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#00D26A]'
                          }`}
                          style={{ width: `${(credit.remaining / credit.total) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${
                        credit.remaining / credit.total <= 0.2 ? 'text-[#EF4444]' : 'text-[#8A8F98]'
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
            <div className="px-4 py-3 bg-[#F59E0B]/[0.06] border-t border-[#F59E0B]/[0.15]">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#F59E0B]">Running low on credits</p>
                  <a href="/pricing" className="text-xs text-[#F59E0B]/80 hover:text-[#F59E0B] underline transition-colors duration-150">
                    Upgrade for more
                  </a>
                </div>
              </div>
            </div>
          )}

          {tier !== 'pro' && tier !== 'team' && (
            <div className="p-4 border-t border-white/[0.06]">
              <a
                href="/pricing"
                className="block w-full py-2 text-center text-sm font-medium bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
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
    <div className="bg-[#1A1A24] border border-white/[0.06] rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#00D26A] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-[#E8E8ED]">Your Credits</h3>
          <p className="text-sm text-[#8A8F98]">Track your monthly usage</p>
        </div>
      </div>

      <div className="space-y-4">
        {credits.map((credit) => (
          <div key={credit.feature} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#E8E8ED]">{credit.display_name}</span>
              {credit.unlimited ? (
                <span className="text-sm text-[#00D26A] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Unlimited
                </span>
              ) : (
                <span className={`text-sm ${
                  credit.remaining / credit.total <= 0.2 ? 'text-[#EF4444]' : 'text-[#8A8F98]'
                }`}>
                  {credit.remaining} of {credit.total} remaining
                </span>
              )}
            </div>

            {!credit.unlimited && (
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    credit.remaining / credit.total <= 0.2
                      ? 'bg-[#EF4444]'
                      : credit.remaining / credit.total <= 0.5
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#00D26A]'
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
