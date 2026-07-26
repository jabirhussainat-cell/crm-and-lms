'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffNavbar } from '@/components/layout/StaffNavbar';
import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import {
  Clock,
  CheckCircle2,
  LogOut,
  LogIn,
  Calendar,
  ClipboardList,
  PhoneCall
} from 'lucide-react';
import Link from 'next/link';

export default function StaffPortalPage() {
  const router = useRouter();
  const { user, isReady, checkInStaff, checkOutStaff, getActiveAttendance, attendanceRecords } =
    useAuth();
  const { getStaffLeads } = useCRM();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shiftNotes, setShiftNotes] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (isReady && !user) router.replace('/');
  }, [isReady, user, router]);

  const activeRecord = user ? getActiveAttendance(user.id) : undefined;
  const isCheckedIn = !!activeRecord;

  const staffLeads = useMemo(() => {
    if (!user) return [];
    return getStaffLeads(user.id, dateFrom || undefined, dateTo || undefined);
  }, [user, getStaffLeads, dateFrom, dateTo]);

  const staffAttendance = useMemo(() => {
    if (!user) return [];
    return attendanceRecords
      .filter((r) => {
        if (r.staffId !== user.id) return false;
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo && r.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || (b.checkInTime || '').localeCompare(a.checkInTime || ''));
  }, [attendanceRecords, user, dateFrom, dateTo]);

  const closedCount = staffLeads.filter((l) => l.status === 'closed').length;
  const openCount = staffLeads.filter((l) => l.status === 'open').length;

  const handleCheckIn = () => {
    checkInStaff(shiftNotes || 'Daily shift check-in');
    setShiftNotes('');
  };

  const handleCheckOut = () => {
    checkOutStaff(shiftNotes || 'Shift completed');
    setShiftNotes('');
  };

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
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              Menu 1 · Attendance
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words">
              Hi, {user.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Check in / out, review lead counts, and see your attendance log.
            </p>
          </div>

          {/* Date filter */}
          <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-blue-400" />
              Date filter
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-xs text-slate-400 hover:text-white px-3 py-2.5 min-h-11"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Leads (filtered)" value={staffLeads.length} accent="text-blue-400" />
            <StatCard label="Open" value={openCount} accent="text-amber-300" />
            <StatCard label="Closed" value={closedCount} accent="text-emerald-400" />
            <StatCard
              label="Attendance logs"
              value={staffAttendance.length}
              accent="text-cyan-300"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check-in / out */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Shift Check-In / Out
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isCheckedIn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
              </div>

              {isCheckedIn && activeRecord && (
                <p className="text-xs text-slate-400">
                  Since <span className="text-white font-mono">{activeRecord.checkInTime}</span> on{' '}
                  {activeRecord.date}
                </p>
              )}

              <textarea
                rows={2}
                placeholder="Optional shift note…"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={isCheckedIn}
                  onClick={handleCheckIn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 min-h-12 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
                <button
                  type="button"
                  disabled={!isCheckedIn}
                  onClick={handleCheckOut}
                  className="flex-1 flex items-center justify-center gap-2 py-3 min-h-12 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              </div>

              <Link
                href="/staff-portal/record-leads"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border border-blue-500/40 text-blue-300 hover:bg-blue-600/10"
              >
                <ClipboardList className="w-4 h-4" />
                Go to Record Leads →
              </Link>
            </div>

            {/* Attendance log */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Check-In / Check-Out Log
              </h2>

              {staffAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No attendance records for this range.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {staffAttendance.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs min-w-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{rec.date}</p>
                        <p className="text-slate-400 mt-0.5">
                          In <span className="text-emerald-400 font-mono">{rec.checkInTime}</span>
                          {rec.checkOutTime && (
                            <>
                              {' '}
                              · Out <span className="text-rose-300 font-mono">{rec.checkOutTime}</span>
                            </>
                          )}
                        </p>
                        {rec.notes && (
                          <p className="text-slate-500 mt-1 italic break-words">{rec.notes}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          rec.status === 'checked_in'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {rec.status === 'checked_in' ? 'In' : 'Out'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lead list preview */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-400" />
                My Leads ({staffLeads.length})
              </h2>
              <Link href="/staff-portal/record-leads" className="text-[11px] text-blue-400 hover:underline">
                Record new →
              </Link>
            </div>
            {staffLeads.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No leads in this date range.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {staffLeads.slice(0, 20).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs min-w-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{lead.customerName}</p>
                      <p className="text-slate-400 break-words">
                        {lead.location || '—'} · {lead.checkInDate || 'no date'} · {lead.noOfAdults}A /{' '}
                        {lead.noOfKids}K
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        lead.status === 'closed'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : lead.status === 'follow_up'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}
