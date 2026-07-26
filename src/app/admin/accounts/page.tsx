'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import {
  buildStaffEarnings,
  dealProfit,
  formatINR,
  formatProfitLoss,
  inDateRange,
  profitLossColor,
  STAFF_PROFIT_SHARE,
  TRIPELOO_PROFIT_SHARE,
  tripelooShareFromDeal
} from '@/lib/finance';
import {
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  Income,
  IncomeCategory,
  INCOME_CATEGORIES
} from '@/types/crm';
import { Wallet, Plus, Trash2, X, Users, Filter } from 'lucide-react';

export default function AdminAccountsPage() {
  const { user } = useAuth();
  const { leads } = useCRM();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  const load = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const q = params.toString();
    try {
      const [eRes, iRes] = await Promise.all([
        fetch(`/api/expenses?${q}`),
        fetch(`/api/incomes?${q}`)
      ]);
      const eJson = await eRes.json();
      const iJson = await iRes.json();
      if (eJson.success) setExpenses(eJson.data);
      if (iJson.success) setIncomes(iJson.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const closed = useMemo(() => {
    return leads.filter((l) => {
      if (l.status !== 'closed') return false;
      const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
      return inDateRange(d, dateFrom || undefined, dateTo || undefined);
    });
  }, [leads, dateFrom, dateTo]);

  const staffRows = useMemo(
    () => buildStaffEarnings(leads, dateFrom || undefined, dateTo || undefined),
    [leads, dateFrom, dateTo]
  );

  const totalDealProfit = useMemo(
    () => closed.reduce((s, l) => s + dealProfit(l), 0),
    [closed]
  );
  const totalStaffEarnings = totalDealProfit * STAFF_PROFIT_SHARE;
  const totalTripelooShare = totalDealProfit * TRIPELOO_PROFIT_SHARE;
  const expenseTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const incomeTotal = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  /** Tripeloo net in accounts = 60% share + manual income − expenses */
  const tripelooNet = totalTripelooShare + incomeTotal - expenseTotal;

  const saveExpense = async (payload: Omit<Expense, 'id' | 'createdAt'>) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        id: `exp_${Date.now()}`,
        createdAt: new Date().toISOString()
      })
    });
    setExpenseOpen(false);
    await load();
  };

  const saveIncome = async (payload: Omit<Income, 'id' | 'createdAt'>) => {
    await fetch('/api/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        id: `inc_${Date.now()}`,
        createdAt: new Date().toISOString()
      })
    });
    setIncomeOpen(false);
    await load();
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-black text-white">Accounts</h1>
            </div>
            <p className="text-sm text-slate-400">
              Deal profit (B2B − B2C, or % of B2B) · Staff 40% · Tripeloo 60%. Add income &amp;
              expenses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIncomeOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Income
            </button>
            <button
              type="button"
              onClick={() => setExpenseOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          </div>
        </div>

        {/* Date filter */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Date filter
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Deal profit (100%)" value={formatINR(totalDealProfit)} />
          <Stat label="Staff earnings (40%)" value={formatINR(totalStaffEarnings)} accent="text-blue-300" />
          <Stat label="Tripeloo share (60%)" value={formatINR(totalTripelooShare)} accent="text-amber-300" />
          <Stat label="Manual income" value={formatINR(incomeTotal)} accent="text-emerald-400" />
          <Stat
            label="Tripeloo net"
            value={formatProfitLoss(tripelooNet)}
            accent={profitLossColor(tripelooNet)}
          />
        </div>
        <p className="text-[11px] text-slate-500 -mt-2">
          Tripeloo net = 60% deal share + income − expenses ({formatINR(expenseTotal)} expenses)
        </p>

        {/* Staff-wise earnings */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Staff-wise earnings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Deals closed</th>
                  <th className="px-4 py-3">Deal profit</th>
                  <th className="px-4 py-3">Staff earned (40%)</th>
                  <th className="px-4 py-3">Tripeloo left (60%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No closed deals with profit share in this range.
                    </td>
                  </tr>
                ) : (
                  staffRows.map((r) => (
                    <tr key={r.staffId} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-white font-semibold">{r.staffName}</td>
                      <td className="px-4 py-3 text-slate-300">{r.dealsClosed}</td>
                      <td className="px-4 py-3 font-mono text-slate-200">{formatINR(r.dealProfit)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-300">
                        {formatINR(r.staffEarnings)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {formatINR(r.tripelooShare)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-deal breakdown */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Closed deals — profit split</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Share type</th>
                  <th className="px-4 py-3">B2B</th>
                  <th className="px-4 py-3">B2C</th>
                  <th className="px-4 py-3">Deal profit</th>
                  <th className="px-4 py-3">Staff 40%</th>
                  <th className="px-4 py-3">Tripeloo 60%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {closed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No closed deals.
                    </td>
                  </tr>
                ) : (
                  closed.map((l) => {
                    const profit = dealProfit(l);
                    return (
                      <tr key={l.id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 text-white font-semibold">{l.customerName}</td>
                        <td className="px-4 py-3 text-slate-300">{l.staffName}</td>
                        <td className="px-4 py-3 text-slate-400">{l.profitShare || '—'}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">{l.b2b || '—'}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">{l.b2c || '—'}</td>
                        <td className="px-4 py-3 font-mono text-white">{formatINR(profit)}</td>
                        <td className="px-4 py-3 font-mono text-blue-300">
                          {formatINR(profit * STAFF_PROFIT_SHARE)}
                        </td>
                        <td className="px-4 py-3 font-mono text-amber-300">
                          {formatINR(tripelooShareFromDeal(l))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Income & expense lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EntryList
            title="Income entries"
            empty="No income entries"
            items={incomes.map((i) => ({
              id: i.id,
              title: i.title,
              meta: `${i.date} · ${i.category}`,
              amount: i.amount,
              amountClass: 'text-emerald-400'
            }))}
            onDelete={async (id) => {
              await fetch(`/api/incomes?id=${id}`, { method: 'DELETE' });
              await load();
            }}
          />
          <EntryList
            title="Expense entries"
            empty="No expense entries"
            items={expenses.map((e) => ({
              id: e.id,
              title: e.title,
              meta: `${e.date} · ${e.category}`,
              amount: e.amount,
              amountClass: 'text-rose-400'
            }))}
            onDelete={async (id) => {
              await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
              await load();
            }}
          />
        </div>
      </div>

      {expenseOpen && user && (
        <MoneyModal
          title="Add Expense"
          accent="rose"
          categories={EXPENSE_CATEGORIES}
          onClose={() => setExpenseOpen(false)}
          onSave={(data) =>
            saveExpense({
              title: data.title,
              amount: data.amount,
              category: data.category as ExpenseCategory,
              date: data.date,
              notes: data.notes,
              createdById: user.id,
              createdByName: user.name
            })
          }
        />
      )}

      {incomeOpen && user && (
        <MoneyModal
          title="Add Income"
          accent="emerald"
          categories={INCOME_CATEGORIES}
          onClose={() => setIncomeOpen(false)}
          onSave={(data) =>
            saveIncome({
              title: data.title,
              amount: data.amount,
              category: data.category as IncomeCategory,
              date: data.date,
              notes: data.notes,
              createdById: user.id,
              createdByName: user.name
            })
          }
        />
      )}
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  accent = 'text-white'
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`text-xl font-black font-mono mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function EntryList({
  title,
  empty,
  items,
  onDelete
}: {
  title: string;
  empty: string;
  items: { id: string; title: string; meta: string; amount: number; amountClass: string }[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">{empty}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-slate-500 mt-0.5">{item.meta}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-mono font-bold ${item.amountClass}`}>
                  {formatINR(item.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this entry?')) onDelete(item.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoneyModal({
  title,
  accent,
  categories,
  onClose,
  onSave
}: {
  title: string;
  accent: 'rose' | 'emerald';
  categories: string[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    notes: string;
  }) => void;
}) {
  const [formTitle, setFormTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const btn =
    accent === 'rose'
      ? 'bg-rose-600 hover:bg-rose-500'
      : 'bg-emerald-600 hover:bg-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave({
            title: formTitle.trim(),
            amount: Number(amount) || 0,
            category,
            date,
            notes: notes.trim()
          });
          setSaving(false);
        }}
        className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          required
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
        />
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white"
        />
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-60 ${btn}`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
