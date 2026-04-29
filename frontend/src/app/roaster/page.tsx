'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Flame,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
} from 'lucide-react';

interface Resume {
  id: string;
  original_filename: string;
  created_at: string;
}

interface Score {
  category: string;
  score: number;
  label: string;
  summary: string;
}

interface Suggestion {
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  example: string;
}

interface RoastResult {
  overall_score: number;
  overall_label: string;
  scores: Score[];
  suggestions: Suggestion[];
  highlights: string[];
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function ScoreBar({ score }: { score: number }) {
  const color = score >= 8 ? '#00D26A' : score >= 6 ? '#F59E0B' : '#EF4444';
  return (
    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
      <div className="h-full rounded-full" style={{ width: `${score * 10}%`, backgroundColor: color }} />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'high') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EF4444]/[0.12] text-[#EF4444] border border-[#EF4444]/[0.25]">
        {severity}
      </span>
    );
  }
  if (severity === 'medium') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F59E0B]/[0.12] text-[#F59E0B] border border-[#F59E0B]/[0.25]">
        {severity}
      </span>
    );
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B82F6]/[0.12] text-[#60A5FA] border border-[#3B82F6]/[0.25]">
      {severity}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />;
  if (severity === 'medium') return <AlertCircle className="w-4 h-4 text-[#F59E0B]" />;
  return <Lightbulb className="w-4 h-4 text-[#3B82F6]" />;
}

function ScoreColor({ score, children }: { score: number; children: React.ReactNode }) {
  const cls = score >= 8 ? 'text-[#00D26A]' : score >= 6 ? 'text-[#F59E0B]' : 'text-[#EF4444]';
  return <span className={cls}>{children}</span>;
}

function ScoreBg({ score, children }: { score: number; children: React.ReactNode }) {
  const cls = score >= 8
    ? 'bg-[#00D26A]/[0.12] border-[#00D26A]/[0.25]'
    : score >= 6
    ? 'bg-[#F59E0B]/[0.12] border-[#F59E0B]/[0.25]'
    : 'bg-[#EF4444]/[0.12] border-[#EF4444]/[0.25]';
  return <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium border ${cls}`}>{children}</div>;
}

export default function RoasterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [tone, setTone] = useState<'gentle' | 'direct'>('gentle');
  const [result, setResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await apiClient.listResumes();
      const list = data?.resumes || [];
      setResumes(list);
      if (list.length > 0) setSelectedResumeId(list[0].id);
    } catch {
      // ignore
    }
  };

  const handleRoast = async () => {
    if (!selectedResumeId) return;
    setError('');
    setLoading(true);
    setResult(null);
    setExpandedSuggestions(new Set());
    try {
      const data = await apiClient.roastResume(selectedResumeId, tone);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Roasting failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (idx: number) => {
    setExpandedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const sortedSuggestions = result?.suggestions
    ? [...result.suggestions].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    : [];

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Resume Roaster</h1>
              <p className="text-[#8A8F98] text-sm mt-1">AI-powered resume analysis across 4 dimensions</p>
            </div>
            <Link href="/dashboard" className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1">
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Input Panel */}
          <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Select Resume</label>
                {resumes.length === 0 ? (
                  <Link href="/upload" className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150">
                    Upload a Resume First
                  </Link>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#1A1A24]">
                        {r.original_filename}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Feedback Tone</label>
                <div className="flex gap-1 bg-[#12121A] rounded-lg p-1 border border-white/[0.06] w-fit">
                  <button
                    onClick={() => setTone('gentle')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      tone === 'gentle' ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA]' : 'text-[#8A8F98] hover:text-[#E8E8ED]'
                    }`}
                  >
                    <Zap className="w-4 h-4" /> Gentle
                  </button>
                  <button
                    onClick={() => setTone('direct')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      tone === 'direct' ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA]' : 'text-[#8A8F98] hover:text-[#E8E8ED]'
                    }`}
                  >
                    <Flame className="w-4 h-4" /> Direct
                  </button>
                </div>
              </div>

              {resumes.length > 0 && (
                <button
                  onClick={handleRoast}
                  disabled={loading || !selectedResumeId}
                  className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing resume...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      Roast My Resume
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Overall Score */}
              <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <ScoreBg score={result.overall_score}>
                    <ScoreColor score={result.overall_score}>{result.overall_score}</ScoreColor>
                  </ScoreBg>
                  <div>
                    <div className="text-sm text-[#8A8F98]">Overall Score</div>
                    <div className="text-lg font-medium">
                      <ScoreColor score={result.overall_score}>{result.overall_label}</ScoreColor>
                    </div>
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {result.scores.map((score) => (
                    <div key={score.category} className="p-3 bg-[#12121A] rounded-lg border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#5A5E66]">{score.category}</span>
                        <span className="text-sm font-medium">
                          <ScoreColor score={score.score}>{score.score}</ScoreColor>
                        </span>
                      </div>
                      <ScoreBar score={score.score} />
                      <p className="text-xs text-[#8A8F98] leading-relaxed">{score.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              {result.highlights && result.highlights.length > 0 && (
                <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00D26A]" />
                    <span className="text-sm font-medium text-[#E8E8ED]">What You&apos;re Doing Well</span>
                  </div>
                  <ul className="space-y-2">
                    {result.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#8A8F98]">
                        <span className="text-[#00D26A] mt-0.5 shrink-0">—</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {sortedSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#E8E8ED]">Suggestions ({sortedSuggestions.length})</span>
                  </div>
                  {sortedSuggestions.map((s, idx) => {
                    const isOpen = expandedSuggestions.has(idx);
                    return (
                      <div key={idx} className="bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden">
                        <button
                          onClick={() => toggleSuggestion(idx)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors duration-150 text-left"
                        >
                          <SeverityIcon severity={s.severity} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#E8E8ED]">{s.title}</span>
                              <SeverityBadge severity={s.severity} />
                            </div>
                            <p className="text-xs text-[#8A8F98] mt-0.5">{s.category}</p>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#5A5E66] shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#5A5E66] shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-3 animate-fade-in">
                            <p className="text-sm text-[#8A8F98]">{s.description}</p>
                            <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                              <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Example</span>
                              <p className="text-sm text-[#E8E8ED] mt-1">{s.example}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && resumes.length > 0 && (
            <div className="text-center py-16">
              <Flame className="w-12 h-12 text-[#5A5E66] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">Ready to Roast</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                Select a resume and click Roast to get ATS, Impact, Clarity, and Formatting scores with specific improvement suggestions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
