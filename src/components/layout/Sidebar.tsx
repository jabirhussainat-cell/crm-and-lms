'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, UserCheck, Shield, Clock, ClipboardList, X, Compass } from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

/** Used on leftover admin/directory pages. Staff portal uses StaffSidebar. */
export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Check-In & Overview', href: '/staff-portal', icon: Clock },
    { name: 'Record Leads', href: '/staff-portal/record-leads', icon: ClipboardList },
    { name: 'My Profile', href: '/profile', icon: UserCheck },
    { name: 'Staff Directory', href: '/staff', icon: Users }
  ];

  const content = (
    <div className="flex flex-col h-full py-4 px-3 bg-slate-900/95 border-r border-slate-800 text-slate-300">
      <div className="lg:hidden flex items-center justify-between px-3 pb-4 mb-2 border-b border-slate-800">
        <span className="font-bold text-white text-lg flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" /> Tripeloo
        </span>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-800">
        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
        <p className="text-[10px] text-slate-400 font-mono">{user?.phone}</p>
      </div>

      <div className="flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-600 px-3 mt-4 flex items-center gap-1">
        <Shield className="w-3 h-3" /> Admin: /admin (later)
      </p>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">{content}</aside>
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={onCloseMobile} />
          <div className="relative w-72 h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
};
