'use client';

import React, { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/context/AuthContext';
import { StaffUser, UserRole } from '@/types/crm';
import { Users, Edit, Save, X, Shield } from 'lucide-react';

export default function AdminStaffsPage() {
  const { staffMembers, updateStaffByAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    devicePersonalNumber: '',
    expertise: '',
    languagesKnown: '',
    designation: '',
    adminNotes: '',
    role: 'staff' as UserRole
  });
  const [savedMsg, setSavedMsg] = useState('');

  const startEdit = (s: StaffUser) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      devicePersonalNumber: s.devicePersonalNumber || '',
      expertise: s.expertise || '',
      languagesKnown: s.languagesKnown || '',
      designation: s.designation || '',
      adminNotes: s.adminNotes || '',
      role: s.role || 'staff'
    });
    setSavedMsg('');
  };

  const save = () => {
    if (!editingId) return;
    updateStaffByAdmin(editingId, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      devicePersonalNumber: form.devicePersonalNumber.trim(),
      expertise: form.expertise.trim(),
      languagesKnown: form.languagesKnown.trim(),
      designation: form.designation.trim(),
      adminNotes: form.adminNotes.trim(),
      role: form.role
    });
    setSavedMsg('Saved');
    setEditingId(null);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Staffs</h1>
          </div>
          <p className="text-sm text-slate-400">
            Edit staff profiles, designation, and admin-only notes.
          </p>
          {savedMsg && <p className="text-xs text-emerald-400 mt-1">{savedMsg}</p>}
        </div>

        <div className="space-y-4">
          {staffMembers.length === 0 ? (
            <p className="text-sm text-slate-500 glass-panel p-8 rounded-2xl border border-slate-800 text-center">
              No staff registered yet.
            </p>
          ) : (
            staffMembers.map((s) => (
              <div
                key={s.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                {editingId === s.id ? (
                  <div className="space-y-3">
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Editing profile
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex-1 sm:flex-none px-4 py-3 min-h-11 rounded-lg text-xs text-slate-400 hover:bg-slate-800 flex items-center justify-center gap-1 border border-slate-800"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          type="button"
                          onClick={save}
                          className="flex-1 sm:flex-none px-4 py-3 min-h-11 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                      <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                      <Input
                        label="Tripeloo Number"
                        value={form.phone}
                        onChange={(v) => setForm({ ...form, phone: v })}
                        mono
                      />
                      <Input
                        label="Personal Number"
                        value={form.devicePersonalNumber}
                        onChange={(v) => setForm({ ...form, devicePersonalNumber: v })}
                        mono
                      />
                      <Input
                        label="Designation"
                        value={form.designation}
                        onChange={(v) => setForm({ ...form, designation: v })}
                        placeholder="e.g. Sales Executive"
                      />
                      <div>
                        <label className="block text-slate-400 mb-1">Role</label>
                        <select
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <Input
                        label="Expertise"
                        value={form.expertise}
                        onChange={(v) => setForm({ ...form, expertise: v })}
                      />
                      <Input
                        label="Languages"
                        value={form.languagesKnown}
                        onChange={(v) => setForm({ ...form, languagesKnown: v })}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-amber-300/90 mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        Admin notes (only visible to admin)
                      </label>
                      <textarea
                        rows={3}
                        value={form.adminNotes}
                        onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                        placeholder="Internal notes about this staff member…"
                        className="w-full bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-sm text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          s.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}`
                        }
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">{s.name}</p>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                              s.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {s.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {s.designation || 'No designation'} · {s.expertise || '—'}
                        </p>
                        <p className="text-[11px] font-mono text-emerald-400/90 mt-1">
                          Tripeloo: {s.phone}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          Personal: {s.devicePersonalNumber || '—'}
                        </p>
                        {s.adminNotes && (
                          <p className="mt-2 text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 max-w-lg">
                            <span className="font-bold text-amber-400">Admin note:</span> {s.adminNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 min-h-11 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 w-full sm:w-auto"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  mono
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-slate-400 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}
