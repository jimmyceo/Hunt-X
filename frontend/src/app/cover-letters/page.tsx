'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  FileText,
  Download,
  Sparkles,
  Loader2,
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from 'lucide-react';

interface Evaluation {
  id: string;
  company: string;
  role: string;
  global_score: number;
  created_at: string;
}

interface CoverLetter {
  id: string;
  html_content: string;
  pdf_url: string;
  word_count: number;
  created_at: string;
}

export default function CoverLettersPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvalId, setSelectedEvalId] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [shortVersion, setShortVersion] = useState(false);
  const [loadingEvals, setLoadingEvals] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CoverLetter | null>(null);
  const [history, setHistory] = useState<CoverLetter[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingEvals(true);
    setLoadingHistory(true);
    try {
      const [evalsData, historyData] = await Promise.allSettled([
        apiClient.listEvaluations(),
        apiClient.listCoverLetters(),
      ]);
      if (evalsData.status === 'fulfilled' && Array.isArray(evalsData.value)) {
        setEvaluations(evalsData.value);
        if (evalsData.value.length > 0) setSelectedEvalId(evalsData.value[0].id);
      }
      if (historyData.status === 'fulfilled' && Array.isArray(historyData.value)) {
        setHistory(historyData.value);
      }
    } catch {
      // silently handle
    } finally {
      setLoadingEvals(false);
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedEvalId) return;
    setError('');
    setGenerating(true);
    setResult(null);
    setShowPreview(false);
    try {
      const data = await apiClient.generateCoverLetter(
        selectedEvalId,
        hiringManager || undefined,
        shortVersion
      );
      if (data?.html_content) {
        setResult(data);
        setShowPreview(true);
        // Refresh history
        const h = await apiClient.listCoverLetters();
        if (Array.isArray(h)) setHistory(h);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setGenerating(false);
    }
  };

  const selectedEval = evaluations.find((e) => e.id === selectedEvalId);
  const matchScore = selectedEval ? Math.round(selectedEval.global_score * 20) : 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Cover Letters</h1>
              <p className="text-[#8A8F98] text-sm mt-1">
                Personalized cover letters tailored to any job
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Generate Form */}
          <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 mb-6">
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
              Select Job Evaluation
            </label>
            {loadingEvals ? (
              <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading evaluations...
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#8A8F98] text-sm mb-3">No evaluations found.</p>
                <Link
                  href="/generate"
                  className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150"
                >
                  Create an Evaluation First
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedEvalId}
                  onChange={(e) => setSelectedEvalId(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                >
                  {evaluations.map((e) => (
                    <option key={e.id} value={e.id} className="bg-[#1A1A24]">
                      {e.role} at {e.company} — Match: {Math.round(e.global_score * 20)}%
                    </option>
                  ))}
                </select>

                {selectedEval && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#8A8F98]">Match Score:</span>
                    <span
                      className={`font-medium ${
                        matchScore >= 80
                          ? 'text-[#00D26A]'
                          : matchScore >= 50
                          ? 'text-[#F59E0B]'
                          : 'text-[#EF4444]'
                      }`}
                    >
                      {matchScore}%
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
                      Hiring Manager Name
                    </label>
                    <input
                      type="text"
                      value={hiringManager}
                      onChange={(e) => setHiringManager(e.target.value)}
                      placeholder="e.g. Jane Smith (optional)"
                      className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shortVersion}
                        onChange={(e) => setShortVersion(e.target.checked)}
                        className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.02] text-[#3B82F6] focus:ring-[#3B82F6]/20"
                      />
                      <span className="text-sm text-[#8A8F98]">Short version (200 words)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!selectedEvalId || generating}
                  className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Preview */}
          {result && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-[#E8E8ED]">Preview</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5A5E66]">{result.word_count} words</span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-[#60A5FA] hover:text-[#3B82F6] flex items-center gap-1 transition-colors duration-150"
                  >
                    {showPreview ? (
                      <>
                        Collapse <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Expand <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              {showPreview && (
                <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                  <div
                    className="prose max-w-none prose-invert"
                    dangerouslySetInnerHTML={{ __html: result.html_content }}
                  />
                </div>
              )}
              <div className="flex gap-3 mt-3">
                {result.pdf_url && (
                  <a
                    href={result.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-[#3B82F6]/[0.12] hover:bg-[#3B82F6]/[0.2] text-[#60A5FA] border border-[#3B82F6]/[0.25] rounded-md font-medium transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <h2 className="text-lg font-medium text-[#E8E8ED] mb-3">Previous Cover Letters</h2>
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : history.length === 0 ? (
              <p className="text-[#5A5E66] text-sm">No cover letters generated yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06] flex items-center justify-between hover:border-white/[0.10] transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-[#3B82F6]/[0.12] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#60A5FA]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#E8E8ED] font-medium">Cover Letter</p>
                        <p className="text-xs text-[#5A5E66]">
                          {new Date(item.created_at).toLocaleDateString()} · {item.word_count} words
                        </p>
                      </div>
                    </div>
                    {item.pdf_url && (
                      <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs text-[#60A5FA] hover:text-[#3B82F6] border border-[#3B82F6]/[0.25] rounded-md transition-colors duration-150 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
