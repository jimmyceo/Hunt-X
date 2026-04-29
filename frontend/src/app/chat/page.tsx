'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Bot,
  Send,
  Loader2,
  AlertTriangle,
  User,
  Trash2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface Evaluation {
  id: string;
  company: string;
  role: string;
  global_score: number;
  resume_id?: string;
}

interface Resume {
  id: string;
  filename: string;
  created_at: string;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  proof_points?: string[];
}

interface ChatSession {
  job_id: string;
  company: string;
  job_title: string;
  match_score: number;
  message_count: number;
}

export default function ChatPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedEvalId, setSelectedEvalId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [evalsData, resumesData] = await Promise.allSettled([
        apiClient.listEvaluations(),
        apiClient.listResumes(),
      ]);
      if (evalsData.status === 'fulfilled' && Array.isArray(evalsData.value)) {
        setEvaluations(evalsData.value);
        if (evalsData.value.length > 0) {
          setSelectedEvalId(evalsData.value[0].id);
        }
      }
      if (resumesData.status === 'fulfilled' && Array.isArray(resumesData.value)) {
        const r = resumesData.value;
        setResumes(r);
        if (r.length > 0) {
          // Try to find matching resume from evaluation, else first
          const firstEval = evalsData.status === 'fulfilled' && Array.isArray(evalsData.value)
            ? evalsData.value[0]
            : null;
          if (firstEval?.resume_id) {
            setSelectedResumeId(firstEval.resume_id);
          } else {
            setSelectedResumeId(r[0].id);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedEvalId || !selectedResumeId) return;
    setError('');
    setStarting(true);
    try {
      const data = await apiClient.startChat(selectedEvalId, selectedResumeId);
      if (data?.job_id) {
        setSession(data);
        // Load history
        const history = await apiClient.getChatHistory(data.job_id);
        if (Array.isArray(history)) {
          setMessages(history);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start chat session');
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session || sending) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, timestamp: new Date().toISOString() },
    ]);
    setSending(true);
    setError('');
    try {
      const data = await apiClient.askChat(session.job_id, question);
      if (data?.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: data.role || 'assistant',
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
            proof_points: data.proof_points,
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!session) return;
    try {
      await apiClient.clearChat(session.job_id);
      setMessages([]);
    } catch {
      // ignore
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
              <h1 className="text-2xl font-medium text-[#E8E8ED]">AI Career Coach</h1>
              <p className="text-[#8A8F98] text-sm mt-1">
                Ask anything about your job applications, interviews, or career strategy
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Session Setup */}
          {!session && (
            <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 mb-6">
              {loadingData ? (
                <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading data...
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
                  <div>
                    <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
                      Select Job Evaluation
                    </label>
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
                  </div>

                  {resumes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
                        Select Resume
                      </label>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                      >
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id} className="bg-[#1A1A24]">
                            {r.filename}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  <button
                    onClick={handleStartChat}
                    disabled={!selectedEvalId || !selectedResumeId || starting}
                    className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {starting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Start Coaching Session
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Active Chat */}
          {session && (
            <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#3B82F6]/[0.12] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#E8E8ED]">
                      {session.job_title} at {session.company}
                    </p>
                    <p className="text-xs text-[#5A5E66]">
                      Match: {Math.round(session.match_score * 20)}% · {messages.length} messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="p-2 text-[#5A5E66] hover:text-[#EF4444] hover:bg-[#EF4444]/[0.08] rounded-md transition-colors duration-150"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSession(null);
                      setMessages([]);
                      setError('');
                    }}
                    className="text-xs text-[#60A5FA] hover:text-[#3B82F6] px-3 py-1.5 border border-[#3B82F6]/[0.25] rounded-md transition-colors duration-150"
                  >
                    New Session
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-10 h-10 text-[#5A5E66] mx-auto mb-3" />
                    <p className="text-sm text-[#8A8F98]">
                      Ask me anything about this role — interview tips, salary negotiation, how to highlight your experience, or what questions to expect.
                    </p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 rounded-md bg-[#3B82F6]/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-[#60A5FA]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-[#1A1A24] border border-white/[0.06] text-[#E8E8ED]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.proof_points && msg.proof_points.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06]">
                          <p className="text-xs text-[#5A5E66] mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.proof_points.map((pt, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 bg-white/[0.04] text-[#8A8F98] rounded-full border border-white/[0.06]"
                              >
                                {pt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-md bg-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-[#8A8F98]" />
                      </div>
                    )}
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-7 h-7 rounded-md bg-[#3B82F6]/[0.12] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#60A5FA]" />
                    </div>
                    <div className="bg-[#1A1A24] border border-white/[0.06] rounded-lg px-4 py-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about interview tips, salary negotiation, follow-up strategy..."
                    className="flex-1 px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="px-5 py-3 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
