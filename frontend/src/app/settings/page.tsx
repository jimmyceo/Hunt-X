'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

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
    <div className="min-h-screen bg-[#f6f9fc]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-light text-[#061b31]">Settings</h1>
            <p className="text-[#64748d] text-sm mt-1">Manage your profile and preferences</p>
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-xl border border-[#e5edf5] p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-[#f6f9fc] border border-[#e5edf5] text-[#64748d] cursor-not-allowed"
              />
              <p className="text-xs text-[#64748d] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061b31] mb-1">Plan</label>
              <div className="px-4 py-3 rounded-lg bg-[#f6f9fc] border border-[#e5edf5] text-[#061b31] capitalize">
                {user?.tier || 'Free'}
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.includes('success') ? 'text-[#15be53]' : 'text-[#ea2261]'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 bg-[#533afd] hover:bg-[#4338ca] text-white rounded-lg font-medium transition disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
