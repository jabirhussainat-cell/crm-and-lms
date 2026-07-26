'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, LogOut, ChevronDown, Menu, Clock, ClipboardList, User } from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCreateLeadModal?: () => void;
}

/** Legacy navbar for non-staff-portal pages — no Admin shortcut. */
export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link href="/staff-portal" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white">Tripeloo</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff-portal"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            Check-In
          </Link>
          <Link
            href="/staff-portal/record-leads"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30"
          >
            <ClipboardList className="w-4 h-4" />
            Record Leads
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 border border-slate-700"
            >
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'S')}`
                }
                alt=""
                className="w-8 h-8 rounded-lg bg-slate-800"
              />
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl py-2 z-50">
                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
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
        </div>
      </div>
    </header>
  );
};
