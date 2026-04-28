'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient, setAuthToken } from '@/lib/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await apiClient.login(email, password);
      } else {
        data = await apiClient.register(email, password, name);
      }

      if (data.access_token) {
        setAuthToken(data.access_token);
        window.location.href = '/upload';
      } else {
        setError('Unexpected response from server');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#061b31] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 border border-[#e5edf5] shadow-[0_15px_35px_rgba(23,23,23,0.08)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[#64748d]">
              {isLogin ? 'Sign in to your account' : 'Start your job search journey'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#061b31] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#061b31] hover:bg-[#0a2d4d] text-white rounded-lg font-medium transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                isLogin ? 'Signing in...' : 'Creating account...'
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#533afd] hover:text-[#4128c9] text-sm transition"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
