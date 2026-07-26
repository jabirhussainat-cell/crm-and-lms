'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { FinanceCompareChart } from '@/components/admin/FinanceCompareChart';
import { useCRM } from '@/context/CRMContext';
import {
  buildMonthlyFinance,
  buildQuarterlyFinance,
  formatINR,
  formatProfitLoss,
  profitLossColor,
  inDateRange,
  tripelooShareFromDeal,
  dealProfit
} from '@/lib/finance';
import { Expense, Income } from '@/types/crm';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  Filter
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { leads } = useCRM();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const closedInRange = useMemo(() => {
    return leads.filter((l) => {
      if (l.status !== 'closed') return false;
      const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
      return inDateRange(d, dateFrom || undefined, dateTo || undefined);
    });
  }, [leads, dateFrom, dateTo]);

  const tripelooShare = useMemo(
    () => closedInRange.reduce((sum, l) => sum + tripelooShareFromDeal(l), 0),
    [closedInRange]
  );

  const totalDealProfit = useMemo(
    () => closedInRange.reduce((sum, l) => sum + dealProfit(l), 0),
    [closedInRange]
  );

  const expenseTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const incomeTotal = useMemo(
    () => incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [incomes]
  );

  const netProfit = tripelooShare + incomeTotal - expenseTotal;
  const isProfit = netProfit >= 0;

  const monthly = useMemo(
    () => buildMonthlyFinance(leads, expenses, 6, dateFrom || undefined, dateTo || undefined),
    [leads, expenses, dateFrom, dateTo]
  );

  const quarterly = useMemo(
    () => buildQuarterlyFinance(leads, expenses, dateFrom || undefined, dateTo || undefined),
    [leads, expenses, dateFrom, dateTo]
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Dashboard</h1>
          </div>
          <p className="text-sm text-slate-400">
            Tripeloo net profit (60% of deal profit) after expenses — monthly &amp; quarter graphs.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Deal profit: B2B type → B2B−B2C · % type → B2B×% · Staff keeps 40% (add income/expense
            in Accounts).
          </p>
        </div>

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
              className="text-xs text-slate-400 hover:text-white px-3 py-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Kpi
            label="Tripeloo share (60%)"
            value={formatINR(tripelooShare)}
            hint={`From ${closedInRange.length} closed deals · full deal profit ${formatINR(totalDealProfit)}`}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            accent="border-slate-600"
            valueClass="text-white"
          />
          <Kpi
            label="Expenses"
            value={formatINR(expenseTotal)}
            hint={`${expenses.length} entries · income ${formatINR(incomeTotal)}`}
            icon={<Wallet className="w-5 h-5 text-rose-400" />}
            accent="border-rose-500/30"
          />
          <Kpi
            label={isProfit ? 'Net Profit' : 'Net Loss'}
            value={formatProfitLoss(netProfit)}
            hint="Tripeloo 60% + income − expenses"
            icon={
              isProfit ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )
            }
            accent={isProfit ? 'border-emerald-500/40' : 'border-red-500/40'}
            valueClass={profitLossColor(netProfit)}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <FinanceCompareChart
              data={monthly}
              title="Monthly — Tripeloo 60% vs expenses"
              revenueLabel="Tripeloo 60%"
            />
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <FinanceCompareChart
              data={quarterly}
              title={`Quarter-wise ${new Date().getFullYear()} — Tripeloo net`}
              revenueLabel="Tripeloo 60%"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleList
            title="Recent income"
            empty="No income"
            items={incomes.slice(0, 8).map((i) => ({
              id: i.id,
              title: i.title,
              meta: `${i.date} · ${i.category}`,
              amount: i.amount,
              cls: 'text-emerald-400'
            }))}
            onDelete={async (id) => {
              await fetch(`/api/incomes?id=${id}`, { method: 'DELETE' });
              await load();
            }}
          />
          <SimpleList
            title="Recent expenses"
            empty="No expenses"
            items={expenses.slice(0, 8).map((e) => ({
              id: e.id,
              title: e.title,
              meta: `${e.date} · ${e.category}`,
              amount: e.amount,
              cls: 'text-rose-400'
            }))}
            onDelete={async (id) => {
              await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
              await load();
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  accent,
  valueClass = 'text-white'
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  valueClass?: string;
}) {
  return (
    <div className={`glass-panel p-5 rounded-2xl border ${accent} space-y-2`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl sm:text-3xl font-black font-mono ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

function SimpleList({
  title,
  empty,
  items,
  onDelete
}: {
  title: string;
  empty: string;
  items: { id: string; title: string; meta: string; amount: number; cls: string }[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">{empty}</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-slate-500">{item.meta}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${item.cls}`}>{formatINR(item.amount)}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete?')) onDelete(item.id);
                  }}
                  className="text-slate-500 hover:text-rose-400"
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
