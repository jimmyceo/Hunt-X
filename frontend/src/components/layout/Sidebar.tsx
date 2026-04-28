'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Search,
  FileText,
  FilePlus,
  Mail,
  MessagesSquare,
  Kanban,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSubscription } from '@/lib/subscription-context';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Job Search', href: '/jobs', icon: Search },
  { label: 'My Resumes', href: '/upload', icon: FileText },
  { label: 'CV Generator', href: '/generate', icon: FilePlus },
  { label: 'Cover Letters', href: '/cover-letters', icon: Mail },
  { label: 'Interview Prep', href: '/interview', icon: MessagesSquare },
  { label: 'Application Tracker', href: '/applications', icon: Kanban },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState('');
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const { usage, isLoading } = useSubscription();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
    apiClient.getCurrentUser().then((u) => {
      if (u?.email) setUser(u);
    }).catch(() => {});
  }, []);

  const initials = useMemo(() => {
    if (!user) return '?';
    const name = user.name || user.email;
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  const creditFeature = usage?.features?.find((f) => f.feature === 'cv.generate');
  const creditsUsed = creditFeature?.used ?? 0;
  const creditsTotal = creditFeature?.unlimited ? 999 : (creditFeature?.total ?? 0);
  const creditsPercent = creditFeature?.unlimited ? 100 : creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <Link href="/" className="text-xl font-normal tracking-tight text-[#061b31]">
          Hunt-X
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-normal transition ${
                active
                  ? 'bg-[rgba(83,58,253,0.08)] text-[#533afd]'
                  : 'text-[#64748d] hover:text-[#061b31] hover:bg-[#f6f9fc]'
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-4 space-y-3">
        {/* Credit Indicator */}
        {!isLoading && usage && (
          <div className="p-3 bg-[#f6f9fc] rounded-lg border border-[#e5edf5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#64748d]">Credits</span>
              <span className="text-xs text-[#061b31] font-medium">
                {creditFeature?.unlimited ? 'Unlimited' : `${creditsUsed}/${creditsTotal}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#e5edf5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#533afd] rounded-full transition-all"
                style={{ width: `${Math.min(creditsPercent, 100)}%` }}
              />
            </div>
            <Link
              href="/pricing"
              className="text-xs text-[#533afd] hover:text-[#4128c9] mt-1.5 inline-flex items-center gap-0.5 transition"
            >
              Upgrade <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f6f9fc] transition">
            <div className="w-9 h-9 rounded-full bg-[#533afd] text-white flex items-center justify-center text-xs font-medium shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#061b31] truncate">{user.name || user.email}</p>
              <p className="text-xs text-[#64748d] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 bg-white border border-[#e5edf5] rounded-lg flex items-center justify-center text-[#061b31] shadow-sm"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-[#e5edf5] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[260px] bg-white border-r border-[#e5edf5] z-50 flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <Link href="/" className="text-xl font-normal text-[#061b31]">Hunt-X</Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-[#64748d]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
