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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 safe-pt">
      <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2.5 min-h-11 min-w-11 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/staff-portal" className="flex items-center gap-2 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 sm:block">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white truncate max-[360px]:hidden">
                  Tripeloo
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 max-[360px]:hidden">
                  Staff
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Check-in & Lead Recording</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 min-h-11 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition"
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
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">Tripeloo: {user?.phone}</p>
                    <p className="text-[11px] text-slate-500 truncate">Personal: {user?.devicePersonalNumber}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-amber-300 hover:bg-slate-800"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
