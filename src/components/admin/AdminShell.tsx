'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  PhoneCall,
  Wallet,
  Users,
  StickyNote,
  Menu,
  X,
  Compass,
  LogOut,
  ChevronDown,
  Clock,
  LayoutDashboard
} from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: PhoneCall },
  { name: 'Accounts', href: '/admin/accounts', icon: Wallet },
  { name: 'Staffs', href: '/admin/staffs', icon: Users },
  { name: 'Notes', href: '/admin/notes', icon: StickyNote }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isReady, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (!isAdmin) {
      router.replace('/staff-portal');
    }
  }, [isReady, user, isAdmin, router]);

  if (!isReady || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading admin…
      </div>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full py-4 px-3 bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="lg:hidden flex items-center justify-between px-2 pb-4 mb-2 border-b border-slate-800">
        <span className="font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" /> Admin
        </span>
        <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 px-2">
        <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 mb-1">Tripeloo Admin</p>
        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                active
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/staff-portal"
        className="mt-auto flex items-center gap-2 px-3 py-2 text-[11px] text-slate-400 hover:text-white"
      >
        <Clock className="w-3.5 h-3.5" />
        Staff Portal
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">Tripeloo Admin</p>
              <p className="text-[10px] text-slate-500">Dashboard · Leads · Accounts</p>
            </div>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800"
          >
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
              }
              alt=""
              className="w-8 h-8 rounded-lg"
            />
            <span className="hidden sm:block text-xs font-semibold text-amber-300">Admin</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl py-2 z-50">
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-56 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
          {sidebar}
        </aside>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 h-full z-10">{sidebar}</div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
