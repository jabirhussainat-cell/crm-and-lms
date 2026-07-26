'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffNavbar } from '@/components/layout/StaffNavbar';
import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { StaffProfileCard } from '@/components/profile/StaffProfileCard';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isReady, isAdmin, staffMembers, switchUserRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isReady && !user) router.replace('/');
  }, [isReady, user, router]);

  const adminCount = staffMembers.filter((s) => s.role === 'admin').length;
  const canClaimAdmin = !isAdmin && adminCount < 3;

  if (!isReady || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-20 lg:pb-0">
      <StaffNavbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <StaffSidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Staff Profile</h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Tripeloo number, personal number, expertise, and your lead metrics.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-3 min-h-11 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 w-full sm:w-auto"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Portal
              </Link>
            )}
          </div>

          {canClaimAdmin && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-amber-200">
                Up to 3 admins allowed ({adminCount}/3). Claim admin access if you should be one.
              </p>
              <button
                type="button"
                onClick={() => switchUserRole('admin')}
                className="text-xs font-bold px-4 py-3 min-h-11 rounded-xl bg-amber-500 text-slate-950 shrink-0 w-full sm:w-auto"
              >
                Become Admin
              </button>
            </div>
          )}

          <StaffProfileCard staff={user} isEditable={true} />
        </main>
      </div>
    </div>
  );
}
