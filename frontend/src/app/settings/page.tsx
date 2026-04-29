'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import { Check, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<{ name?: string; email: string; tier: string } | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.getCurrentUser().then((u) => {
      if (u?.email) {
        setUser(u);
        setName(u.name || '');
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.updateProfile(name);
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-[#E8E8ED]">Settings</h1>
            <p className="text-[#8A8F98] text-sm mt-1">Manage your profile and preferences</p>
          </div>

          <form onSubmit={handleSave} className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-[#5A5E66] cursor-not-allowed"
              />
              <p className="text-xs text-[#5A5E66] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Plan</label>
              <div className="px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] capitalize">
                {user?.tier || 'Free'}
              </div>
            </div>

            {message && (
              <div className={`text-sm flex items-center gap-2 ${message.includes('success') ? 'text-[#00D26A]' : 'text-[#EF4444]'}`}>
                {message.includes('success') ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {message}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 active:scale-[0.98]"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
