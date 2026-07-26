'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Clock, ClipboardList, UserCheck, X, Compass } from 'lucide-react';

interface StaffSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navLinks = [
  {
    name: 'Check-In & Overview',
    href: '/staff-portal',
    icon: Clock,
    hint: '1'
  },
  {
    name: 'Record Leads',
    href: '/staff-portal/record-leads',
    icon: ClipboardList,
    hint: '2'
  },
  {
    name: 'My Profile',
    href: '/profile',
    icon: UserCheck,
    hint: null
  }
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const content = (
    <div className="flex flex-col h-full py-4 px-3 bg-slate-900/95 border-r border-slate-800 text-slate-300">
      <div className="lg:hidden flex items-center justify-between px-3 pb-4 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg truncate">Tripeloo</span>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2.5 min-h-11 min-w-11 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Staff')}`
            }
            alt=""
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30 bg-slate-800 shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff'}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Staff Menu</p>
        {navLinks.map((link) => {
          const isActive =
            link.href === '/staff-portal'
              ? pathname === '/staff-portal'
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                  : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{link.name}</span>
              </div>
              {link.hint && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isActive ? 'bg-white/20' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {link.hint}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 safe-pt safe-pb">
            {content}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 pt-1.5 safe-pb flex items-stretch justify-around gap-1">
        <Link
          href="/staff-portal"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 rounded-xl ${
            pathname === '/staff-portal' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Check-In</span>
        </Link>
        <Link
          href="/staff-portal/record-leads"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 rounded-xl ${
            pathname.startsWith('/staff-portal/record-leads')
              ? 'text-blue-400 font-bold bg-blue-500/10'
              : 'text-slate-400'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Leads</span>
        </Link>
        <Link
          href="/profile"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 rounded-xl ${
            pathname === '/profile' ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </>
  );
};
