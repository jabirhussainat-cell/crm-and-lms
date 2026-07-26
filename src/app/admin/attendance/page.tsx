'use client';

import React, { useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/context/AuthContext';
import { AttendanceStatus } from '@/types/crm';
import { Clock, Filter, Users } from 'lucide-react';

export default function AdminAttendancePage() {
  const { staffMembers, attendanceRecords } = useAuth();

  const [staffId, setStaffId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<AttendanceStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const currentlyIn = useMemo(() => {
    return attendanceRecords.filter((r) => r.status === 'checked_in');
  }, [attendanceRecords]);

  const filtered = useMemo(() => {
    return attendanceRecords
      .filter((r) => {
        if (staffId !== 'all' && r.staffId !== staffId) return false;
        if (status !== 'all' && r.status !== status) return false;
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo && r.date > dateTo) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!r.staffName.toLowerCase().includes(q) && !(r.notes || '').toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const d = b.date.localeCompare(a.date);
        if (d !== 0) return d;
        return (b.checkInTime || '').localeCompare(a.checkInTime || '');
      });
  }, [attendanceRecords, staffId, dateFrom, dateTo, status, search]);

  const today = new Date().toISOString().split('T')[0];
  const todayCount = attendanceRecords.filter((r) => r.date === today).length;
  const todayCheckedIn = attendanceRecords.filter(
    (r) => r.date === today && r.status === 'checked_in'
  ).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Staff Attendance</h1>
          </div>
          <p className="text-sm text-slate-400">
            Check-in / check-out logs for all staff. Filter by person and date.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Currently checked in" value={currentlyIn.length} accent="text-emerald-400" />
          <Stat label="Today's logs" value={todayCount} accent="text-white" />
          <Stat label="Today still in" value={todayCheckedIn} accent="text-cyan-300" />
          <Stat label="Total records" value={attendanceRecords.length} accent="text-slate-300" />
        </div>

        {/* Who is in now */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Currently checked in
          </h2>
          {currentlyIn.length === 0 ? (
            <p className="text-xs text-slate-500">No one is checked in right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentlyIn.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/20"
                >
                  <img
                    src={
                      r.staffAvatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.staffName)}`
                    }
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{r.staffName}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">
                      In since {r.checkInTime} · {r.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Staff</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="all">All staff</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus | 'all')}
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="all">All</option>
                <option value="checked_in">Checked in</option>
                <option value="checked_out">Checked out</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or notes…"
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Log table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Attendance log ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check in</th>
                  <th className="px-4 py-3">Check out</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No attendance records match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              r.staffAvatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.staffName)}`
                            }
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                          />
                          <span className="font-semibold text-white">{r.staffName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{r.date}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{r.checkInTime}</td>
                      <td className="px-4 py-3 font-mono text-rose-300">
                        {r.checkOutTime || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            r.status === 'checked_in'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {r.status === 'checked_in' ? 'Checked in' : 'Checked out'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({
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
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}
