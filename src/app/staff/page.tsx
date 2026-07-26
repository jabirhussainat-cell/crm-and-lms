'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StaffProfileCard } from '@/components/profile/StaffProfileCard';
import { LeadModal } from '@/components/leads/LeadModal';
import { useAuth } from '@/context/AuthContext';
import { Users, Shield, Plus, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function StaffDirectoryPage() {
  const { staffMembers, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenCreateLeadModal={() => setIsLeadModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Tripeloo Staff Directory
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {staffMembers.length} Team Members
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                View team profiles, contact information, department focus areas, and sales performance metrics.
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New Staff</span>
            </Link>
          </div>

          {/* Staff Profile Cards Grid */}
          <div className="space-y-6">
            {staffMembers.map((staff) => (
              <StaffProfileCard key={staff.id} staff={staff} isEditable={true} />
            ))}
          </div>
        </main>
      </div>

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
    </div>
  );
}
