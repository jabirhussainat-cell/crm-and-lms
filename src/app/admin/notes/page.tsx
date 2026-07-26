'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/context/AuthContext';
import { AdminNote, AdminNoteLabel, ADMIN_NOTE_LABELS } from '@/types/crm';
import { StickyNote, Plus, Trash2, Filter } from 'lucide-react';

export default function AdminNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [labelFilter, setLabelFilter] = useState<AdminNoteLabel | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [text, setText] = useState('');
  const [label, setLabel] = useState<AdminNoteLabel>('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (labelFilter !== 'all') params.set('label', labelFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const res = await fetch(`/api/admin-notes?${params}`);
      const json = await res.json();
      if (json.success) setNotes(json.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelFilter, dateFrom, dateTo]);

  const labelCounts = useMemo(() => {
    const c: Record<string, number> = {};
    notes.forEach((n) => {
      c[n.label] = (c[n.label] || 0) + 1;
    });
    return c;
  }, [notes]);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSaving(true);
    const payload: AdminNote = {
      id: `note_${Date.now()}`,
      text: text.trim(),
      label,
      date,
      createdById: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString()
    };
    try {
      await fetch('/api/admin-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setText('');
      setDate(new Date().toISOString().split('T')[0]);
      await load();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    await fetch(`/api/admin-notes?id=${id}`, { method: 'DELETE' });
    await load();
  };

  const labelColor = (l: string) => {
    const map: Record<string, string> = {
      Accounts: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      Operations: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      Tech: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      HR: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      Sales: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      General: 'bg-slate-700/50 text-slate-300 border-slate-600'
    };
    return map[l] || map.General;
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StickyNote className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">General Notes</h1>
          </div>
          <p className="text-sm text-slate-400">
            Dated notes with labels — Accounts, Operations, Tech, and more.
          </p>
        </div>

        <form
          onSubmit={addNote}
          className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
        >
          <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New note
          </p>
          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note…"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Label</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value as AdminNoteLabel)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                {ADMIN_NOTE_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add note'}
          </button>
        </form>

        <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value as AdminNoteLabel | 'all')}
              className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
            >
              <option value="all">All labels</option>
              {ADMIN_NOTE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        {Object.keys(labelCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(labelCounts).map(([l, n]) => (
              <span
                key={l}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${labelColor(l)}`}
              >
                {l}: {n}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500 text-center py-8">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8 glass-panel rounded-2xl border border-slate-800">
              No notes yet.
            </p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800 flex gap-3 justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${labelColor(n.label)}`}>
                      {n.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{n.date}</span>
                    <span className="text-[10px] text-slate-600">by {n.createdByName}</span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{n.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(n.id)}
                  className="shrink-0 p-2.5 min-h-11 min-w-11 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
