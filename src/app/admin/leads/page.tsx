'use client';

import React, { useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { MonthlyLeadsChart, buildMonthlyBuckets } from '@/components/admin/MonthlyLeadsChart';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { LeadStatus } from '@/types/crm';
import { PhoneCall, Filter } from 'lucide-react';

export default function AdminLeadsPage() {
  const { staffMembers } = useAuth();
  const { leads } = useCRM();

  const [staffId, setStaffId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (staffId !== 'all' && l.staffId !== staffId) return false;
      if (status !== 'all' && l.status !== status) return false;
      const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          l.customerName.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.staffName.toLowerCase().includes(q) ||
          (l.customerContactNumber || '').includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [leads, staffId, dateFrom, dateTo, status, search]);

  const monthly = useMemo(() => buildMonthlyBuckets(filtered, 6), [filtered]);

  const counts = useMemo(() => {
    return {
      total: filtered.length,
      closed: filtered.filter((l) => l.status === 'closed').length,
      open: filtered.filter((l) => l.status === 'open').length,
      follow_up: filtered.filter((l) => l.status === 'follow_up').length
    };
  }, [filtered]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Leads</h1>
          </div>
          <p className="text-sm text-slate-400">
            Filter by staff and date. Monthly view of closed vs pending.
          </p>
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
                onChange={(e) => setStatus(e.target.value as LeadStatus | 'all')}
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="all">All</option>
                <option value="open">Open / Pending</option>
                <option value="follow_up">Follow-up</option>
                <option value="closed">Closed</option>
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
                placeholder="Name, location, phone…"
                className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total" value={counts.total} color="text-white" />
          <Stat label="Closed" value={counts.closed} color="text-emerald-400" />
          <Stat label="Pending / Open" value={counts.open} color="text-blue-400" />
          <Stat label="Follow-up" value={counts.follow_up} color="text-amber-300" />
        </div>

        {/* Monthly graph */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 min-w-0">
          <h2 className="text-sm font-bold text-white mb-4">Monthly leads (last 6 months)</h2>
          <MonthlyLeadsChart data={monthly} />
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden min-w-0">
          <div className="px-3 sm:px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Lead list ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Customer</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Staff</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Location</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Status</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No leads match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/50">
                      <td className="px-3 sm:px-4 py-3 text-white font-semibold whitespace-nowrap">
                        {l.customerName}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-slate-300 whitespace-nowrap">{l.staffName}</td>
                      <td className="px-3 sm:px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                        {l.checkInDate || '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-slate-300 whitespace-nowrap">
                        {l.location || '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <StatusPill status={l.status} />
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-mono text-emerald-400/90 whitespace-nowrap">
                        {l.customerContactNumber || '—'}
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

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'closed'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : status === 'follow_up'
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  return (
    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
