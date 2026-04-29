'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Star,
  MapPin,
  DollarSign,
  Globe,
  Briefcase,
  Loader2,
  Crown,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  target_roles: string[];
  preferred_location: string;
  min_salary: number | null;
  remote_preference: string;
  primary_resume_id: string | null;
  is_default: boolean;
  created_at: string;
}

interface Resume {
  id: string;
  original_filename: string;
}

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, rRes] = await Promise.all([
        apiClient.listProfiles().catch(() => ({ profiles: [] })),
        apiClient.listResumes().catch(() => ({ resumes: [] })),
      ]);
      setProfiles(pRes.profiles || []);
      setResumes(rRes.resumes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    try {
      await apiClient.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.setDefaultProfile(id);
      setProfiles((prev) =>
        prev.map((p) => ({ ...p, is_default: p.id === id }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to set default');
    }
  };

  const getResumeName = (id: string | null) => {
    if (!id) return 'None selected';
    const r = resumes.find((res) => res.id === id);
    return r?.original_filename || 'Unknown resume';
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Profiles</h1>
              <p className="text-[#8A8F98] text-sm mt-1">
                Manage your job search profiles and preferences
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
              {error}
              <button onClick={() => setError('')} className="ml-2 text-[#E8E8ED] underline">Dismiss</button>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={() => setShowAdd(true)}
            className="mb-6 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium text-sm transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Profile
          </button>

          {/* Add/Edit Modal */}
          {(showAdd || editing) && (
            <ProfileForm
              profile={editing || undefined}
              resumes={resumes}
              onSubmit={async (data) => {
                if (editing) {
                  const res = await apiClient.updateJobProfile(editing.id, data);
                  if (res?.profile) {
                    setProfiles((prev) =>
                      prev.map((p) => (p.id === editing.id ? res.profile : p))
                    );
                  }
                  setEditing(null);
                } else {
                  const res = await apiClient.createProfile(data);
                  if (res?.profile) {
                    setProfiles((prev) => [res.profile, ...prev]);
                  }
                  setShowAdd(false);
                }
              }}
              onCancel={() => { setShowAdd(false); setEditing(null); }}
            />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-[#5A5E66] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">No profiles yet</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto mb-6">
                Create a profile to target specific roles, locations, and salary ranges. Switch profiles anytime.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Create Your First Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`bg-[#1A1A24] rounded-lg border ${profile.is_default ? 'border-[#3B82F6]/[0.25]' : 'border-white/[0.06]'} p-5 hover:border-white/[0.10] transition-colors duration-150`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-[#E8E8ED]">{profile.name}</h3>
                        {profile.is_default && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#3B82F6]/[0.15] text-[#60A5FA] rounded-full border border-[#3B82F6]/[0.25] flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A8F98] mt-2">
                        {profile.target_roles?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {profile.target_roles.join(', ')}
                          </span>
                        )}
                        {profile.preferred_location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.preferred_location}
                          </span>
                        )}
                        {profile.min_salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Min {profile.min_salary.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {profile.remote_preference}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {getResumeName(profile.primary_resume_id)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!profile.is_default && (
                        <button
                          onClick={() => handleSetDefault(profile.id)}
                          className="p-1.5 text-[#5A5E66] hover:text-[#3B82F6] transition-colors duration-150"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditing(profile)}
                        className="p-1.5 text-[#5A5E66] hover:text-[#E8E8ED] transition-colors duration-150"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="p-1.5 text-[#5A5E66] hover:text-[#EF4444] transition-colors duration-150"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileForm({
  profile,
  resumes,
  onSubmit,
  onCancel,
}: {
  profile?: Profile;
  resumes: Resume[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [targetRoles, setTargetRoles] = useState(profile?.target_roles?.join(', ') || '');
  const [preferredLocation, setPreferredLocation] = useState(profile?.preferred_location || '');
  const [minSalary, setMinSalary] = useState(profile?.min_salary?.toString() || '');
  const [remotePreference, setRemotePreference] = useState(profile?.remote_preference || 'any');
  const [primaryResumeId, setPrimaryResumeId] = useState(profile?.primary_resume_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      target_roles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
      preferred_location: preferredLocation.trim() || undefined,
      min_salary: minSalary ? parseInt(minSalary) : undefined,
      remote_preference: remotePreference,
      primary_resume_id: primaryResumeId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A24] border border-white/[0.06] rounded-lg w-full max-w-lg mx-4 p-6 animate-scale-in">
        <h2 className="text-lg font-medium text-[#E8E8ED] mb-4">
          {profile ? 'Edit Profile' : 'New Profile'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Profile Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Frontend Roles"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Target Roles</label>
            <input
              type="text"
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              placeholder="e.g. Frontend Engineer, React Developer"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Preferred Location</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Remote, London"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Min Salary (USD)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g. 120000"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Remote Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              >
                <option value="any" className="bg-[#1A1A24]">Any</option>
                <option value="remote" className="bg-[#1A1A24]">Remote Only</option>
                <option value="hybrid" className="bg-[#1A1A24]">Hybrid</option>
                <option value="onsite" className="bg-[#1A1A24]">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Primary Resume</label>
              <select
                value={primaryResumeId}
                onChange={(e) => setPrimaryResumeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              >
                <option value="" className="bg-[#1A1A24]">None</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#1A1A24]">
                    {r.original_filename}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {profile ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
