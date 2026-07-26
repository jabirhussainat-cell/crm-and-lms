'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffNavbar } from '@/components/layout/StaffNavbar';
import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import { LeadStatus } from '@/types/crm';
import { ClipboardList, Calendar, ArrowRight, Users, MapPin, FileText, Phone } from 'lucide-react';

const emptyForm = {
  customerName: '',
  noOfKids: 0,
  noOfAdults: 1,
  checkInDate: '',
  checkOutDate: '',
  location: '',
  status: 'open' as LeadStatus,
  customerNotes: '',
  customerContactNumber: '',
  propertyName: '',
  profitShareMode: 'b2b' as 'b2b' | 'percent',
  profitSharePercent: '',
  b2bRef: '',
  cusAdv: '',
  advToProperty: '',
  b2b: '',
  b2c: ''
};

export default function RecordLeadsPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const { addLead, getStaffLeads } = useCRM();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [listFrom, setListFrom] = useState('');
  const [listTo, setListTo] = useState('');

  useEffect(() => {
    if (isReady && !user) router.replace('/');
  }, [isReady, user, router]);

  const isClosed = form.status === 'closed';

  const myLeads = useMemo(() => {
    if (!user) return [];
    return getStaffLeads(user.id, listFrom || undefined, listTo || undefined);
  }, [user, getStaffLeads, listFrom, listTo]);

  const set = (key: keyof typeof emptyForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!form.customerName.trim()) {
      setMessage('Customer name is required');
      return;
    }
    if (!user) return;

    if (isClosed) {
      if (!form.propertyName.trim()) {
        setMessage('For closed leads, fill property name');
        return;
      }
      if (form.profitShareMode === 'percent' && !form.profitSharePercent.trim()) {
        setMessage('Enter profit share percentage');
        return;
      }
    }

    const profitShare =
      form.profitShareMode === 'b2b' ? 'B2B' : String(form.profitSharePercent).replace(/%/g, '').trim();

    setSaving(true);
    await addLead({
      customerName: form.customerName.trim(),
      noOfKids: Number(form.noOfKids) || 0,
      noOfAdults: Number(form.noOfAdults) || 0,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      location: form.location.trim(),
      status: form.status,
      customerNotes: form.customerNotes.trim(),
      customerContactNumber: form.customerContactNumber.trim(),
      propertyName: isClosed ? form.propertyName.trim() : '',
      profitShare: isClosed ? profitShare : '',
      b2bRef: isClosed ? form.b2bRef.trim() : '',
      cusAdv: isClosed ? form.cusAdv.trim() : '',
      advToProperty: isClosed ? form.advToProperty.trim() : '',
      b2b: isClosed ? form.b2b.trim() : '',
      b2c: isClosed ? form.b2c.trim() : '',
      staffId: user.id,
      staffName: user.name
    });
    setSaving(false);
    setForm(emptyForm);
    setMessage('Lead recorded successfully');
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

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-3xl mx-auto w-full min-w-0">
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
              Menu 2 · Record Leads
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-400 shrink-0" />
              Lead Details
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Record leads you took. Business fields unlock when status is Closed.
            </p>
            <p className="text-[11px] text-slate-500 mt-2 break-words">
              Recording as <span className="text-white font-semibold">{user.name}</span> · ID{' '}
              <span className="font-mono text-blue-300">{user.id}</span>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4"
          >
            {/* 1. Customer name */}
            <Field label="Customer Name *" icon={<Users className="w-3.5 h-3.5 text-blue-400" />}>
              <input
                required
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder="Customer full name"
                className={inputCls}
              />
            </Field>

            {/* 2–3. Kids / Adults */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. of Kids">
                <input
                  type="number"
                  min={0}
                  value={form.noOfKids}
                  onChange={(e) => set('noOfKids', Number(e.target.value))}
                  className={inputCls}
                />
              </Field>
              <Field label="No. of Adults">
                <input
                  type="number"
                  min={0}
                  value={form.noOfAdults}
                  onChange={(e) => set('noOfAdults', Number(e.target.value))}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* 4. Check-in / Check-out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Check-In Date" icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}>
                <input
                  type="date"
                  value={form.checkInDate}
                  onChange={(e) => set('checkInDate', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Check-Out Date">
                <input
                  type="date"
                  value={form.checkOutDate}
                  onChange={(e) => set('checkOutDate', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* 5. Location */}
            <Field label="Location" icon={<MapPin className="w-3.5 h-3.5 text-rose-400" />}>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City / destination"
                className={inputCls}
              />
            </Field>

            {/* 6. Customer contact — available before closing */}
            <Field
              label="Customer Contact Number"
              icon={<Phone className="w-3.5 h-3.5 text-emerald-400" />}
            >
              <input
                value={form.customerContactNumber}
                onChange={(e) => set('customerContactNumber', e.target.value)}
                placeholder="+91 …"
                className={`${inputCls} font-mono`}
              />
            </Field>

            {/* 7. Status */}
            <Field label="Status">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['open', 'follow_up', 'closed'] as LeadStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={`py-3 min-h-12 rounded-xl text-sm font-bold capitalize border transition ${
                      form.status === s
                        ? s === 'closed'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : s === 'follow_up'
                            ? 'bg-amber-500 text-white border-amber-400'
                            : 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </Field>

            {/* 8. Customer notes */}
            <Field label="Customer Notes" icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}>
              <textarea
                rows={3}
                value={form.customerNotes}
                onChange={(e) => set('customerNotes', e.target.value)}
                placeholder="Notes about the customer…"
                className={inputCls}
              />
            </Field>

            {/* 9. Business fields — only when closed */}
            {isClosed && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Closed — business details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Property Name *">
                    <input
                      required={isClosed}
                      value={form.propertyName}
                      onChange={(e) => set('propertyName', e.target.value)}
                      placeholder="Property name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Profit share type">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => set('profitShareMode', 'b2b')}
                        className={`py-2.5 rounded-xl text-xs font-bold border ${
                          form.profitShareMode === 'b2b'
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        B2B
                      </button>
                      <button
                        type="button"
                        onClick={() => set('profitShareMode', 'percent')}
                        className={`py-2.5 rounded-xl text-xs font-bold border ${
                          form.profitShareMode === 'percent'
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        % type
                      </button>
                    </div>
                  </Field>
                </div>
                {form.profitShareMode === 'percent' && (
                  <Field label="Profit % (of B2B)">
                    <input
                      required={isClosed}
                      value={form.profitSharePercent}
                      onChange={(e) => set('profitSharePercent', e.target.value)}
                      placeholder="e.g. 10"
                      className={inputCls}
                    />
                  </Field>
                )}
                <p className="text-[10px] text-slate-500">
                  {form.profitShareMode === 'b2b'
                    ? 'B2B type: deal profit = B2B − B2C. Then staff 40% / Tripeloo 60%.'
                    : 'e.g. B2B 5000 & 10% → deal profit 500. Then staff 40% / Tripeloo 60%.'}
                </p>

                <Field label="B2B / Booking Ref (optional)">
                  <input
                    value={form.b2bRef}
                    onChange={(e) => set('b2bRef', e.target.value)}
                    placeholder="Optional reference"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Cus Adv">
                    <input
                      value={form.cusAdv}
                      onChange={(e) => set('cusAdv', e.target.value)}
                      placeholder="Customer advance"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Adv to Property">
                    <input
                      value={form.advToProperty}
                      onChange={(e) => set('advToProperty', e.target.value)}
                      placeholder="Advance to property"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="B2B">
                    <input
                      value={form.b2b}
                      onChange={(e) => set('b2b', e.target.value)}
                      placeholder="B2B amount / value"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="B2C">
                    <input
                      value={form.b2c}
                      onChange={(e) => set('b2c', e.target.value)}
                      placeholder="B2C amount / value"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            )}

            {!isClosed && (
              <p className="text-[11px] text-slate-500 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                Set status to <span className="text-emerald-400 font-semibold">Closed</span> to unlock
                contact, property, advances, B2B & B2C fields.
              </p>
            )}

            {message && (
              <p
                className={`text-xs ${
                  message.includes('success') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl shadow-xl shadow-blue-600/25 transition"
            >
              <span>{saving ? 'Saving…' : 'Submit Lead'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <h2 className="text-sm font-bold text-white">My recorded leads</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={listFrom}
                  onChange={(e) => setListFrom(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                />
                <input
                  type="date"
                  value={listTo}
                  onChange={(e) => setListTo(e.target.value)}
                  className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                />
              </div>
            </div>

            {myLeads.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No leads yet for this range.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {myLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-white truncate min-w-0">{lead.customerName}</p>
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 shrink-0">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-slate-400 break-words">
                      {lead.checkInDate || '—'} → {lead.checkOutDate || '—'} · {lead.location || '—'} ·{' '}
                      {lead.noOfAdults}A / {lead.noOfKids}K
                    </p>
                    {lead.status === 'closed' && (
                      <p className="text-slate-500 break-words">
                        {lead.propertyName}
                        {lead.profitShare || lead.propertyType
                          ? ` · share: ${lead.profitShare || lead.propertyType}`
                          : ''}{' '}
                        · {lead.customerContactNumber}
                      </p>
                    )}
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

const inputCls =
  'w-full min-w-0 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500';

function Field({
  label,
  children,
  icon
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
