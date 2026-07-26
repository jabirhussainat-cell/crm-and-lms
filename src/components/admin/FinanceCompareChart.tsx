'use client';

import React from 'react';
import { FinanceBucket, formatINR, formatProfitLoss, profitLossColor } from '@/lib/finance';

export function FinanceCompareChart({
  data,
  title,
  revenueLabel = 'Revenue'
}: {
  data: FinanceBucket[];
  title: string;
  revenueLabel?: string;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((d) => [d.revenue, d.expenses, Math.abs(d.profit)])
  );

  return (
    <div className="space-y-4 min-w-0">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="chart-scroll">
        <div className="flex items-end gap-3 sm:gap-4 h-52 min-w-[320px] sm:min-w-0">
          {data.map((m) => (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-[2.75rem] sm:min-w-0"
            >
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                <Bar
                  h={Math.round((m.revenue / max) * 100)}
                  color="bg-white"
                  title={`${revenueLabel} ${formatINR(m.revenue)}`}
                />
                <Bar
                  h={Math.round((m.expenses / max) * 100)}
                  color="bg-rose-500"
                  title={`Expense ${formatINR(m.expenses)}`}
                />
                <Bar
                  h={Math.round((Math.abs(m.profit) / max) * 100)}
                  color={m.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
                  title={`${m.profit >= 0 ? 'Profit' : 'Loss'} ${formatProfitLoss(m.profit)}`}
                />
              </div>
              <p className="text-[10px] font-bold text-slate-300 text-center truncate w-full">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] text-slate-400">
        <Legend color="bg-white" label={revenueLabel} />
        <Legend color="bg-rose-500" label="Expenses" />
        <Legend color="bg-emerald-500" label="Profit (+)" />
        <Legend color="bg-red-500" label="Loss (−)" />
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[280px] text-[11px] text-left">
          <thead className="text-slate-500 uppercase text-[9px]">
            <tr>
              <th className="py-1 pr-3">Period</th>
              <th className="py-1 pr-3">{revenueLabel}</th>
              <th className="py-1 pr-3">Expenses</th>
              <th className="py-1">P / L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {data.map((m) => (
              <tr key={m.key}>
                <td className="py-1.5 pr-3 text-slate-300 font-semibold whitespace-nowrap">{m.label}</td>
                <td className="py-1.5 pr-3 text-white font-mono whitespace-nowrap">{formatINR(m.revenue)}</td>
                <td className="py-1.5 pr-3 text-rose-400 font-mono whitespace-nowrap">
                  {formatINR(m.expenses)}
                </td>
                <td className={`py-1.5 font-mono font-bold whitespace-nowrap ${profitLossColor(m.profit)}`}>
                  {formatProfitLoss(m.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Bar({ h, color, title }: { h: number; color: string; title: string }) {
  const height = Math.max(h > 0 ? 4 : 2, h);
  return (
    <div
      className={`w-[28%] max-w-[18px] rounded-t-md ${color} opacity-90`}
      style={{ height: `${height}%` }}
      title={title}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color} ${
          color.includes('white') ? 'ring-1 ring-slate-500' : ''
        }`}
      />
      {label}
    </span>
  );
}
