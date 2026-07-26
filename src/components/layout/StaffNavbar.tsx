'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, LogOut, ChevronDown, Menu, Clock, ClipboardList, User, Shield } from 'lucide-react';

interface StaffNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const StaffNavbar: React.FC<StaffNavbarProps> = ({ onOpenMobileMenu }) => {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link href="/staff-portal" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Tripeloo</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Staff
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Check-in & Lead Recording</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/staff-portal"
            className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            Check-In
          </Link>
          <Link
            href="/staff-portal/record-leads"
            className="hidden sm:flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-2.5 rounded-xl transition"
          >
            <ClipboardList className="w-4 h-4" />
            Record Leads
          </Link>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-2.5 rounded-xl transition"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
            >
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Staff')}`
                }
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/40 bg-slate-800"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{user?.name}</p>
                <span className="text-[10px] text-slate-400 font-mono">{user?.phone}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">Tripeloo: {user?.phone}</p>
                  <p className="text-[11px] text-slate-500">Personal: {user?.devicePersonalNumber}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-amber-300 hover:bg-slate-800"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
