'use client';

import React from 'react';

export interface MonthBucket {
  key: string;
  label: string;
  closed: number;
  open: number;
  follow_up: number;
  total: number;
}

export function MonthlyLeadsChart({ data }: { data: MonthBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 sm:gap-3 h-48">
        {data.map((m) => {
          const h = Math.round((m.total / max) * 100);
          const closedH = m.total ? Math.round((m.closed / m.total) * h) : 0;
          const followH = m.total ? Math.round((m.follow_up / m.total) * h) : 0;
          const openH = Math.max(0, h - closedH - followH);

          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex flex-col justify-end items-stretch gap-0.5" style={{ height: '100%' }}>
                <div className="mt-auto w-full flex flex-col justify-end rounded-t-lg overflow-hidden min-h-[4px]">
                  {openH > 0 && (
                    <div
                      className="w-full bg-blue-500/80"
                      style={{ height: `${openH}%` }}
                      title={`Open: ${m.open}`}
                    />
                  )}
                  {followH > 0 && (
                    <div
                      className="w-full bg-amber-500/80"
                      style={{ height: `${followH}%` }}
                      title={`Follow-up: ${m.follow_up}`}
                    />
                  )}
                  {closedH > 0 && (
                    <div
                      className="w-full bg-emerald-500/80"
                      style={{ height: `${closedH}%` }}
                      title={`Closed: ${m.closed}`}
                    />
                  )}
                  {m.total === 0 && <div className="w-full h-1 bg-slate-800 rounded" />}
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-300">{m.label}</p>
                <p className="text-[9px] text-slate-500">{m.total}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Closed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Follow-up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Open / Pending
        </span>
      </div>
    </div>
  );
}

export function buildMonthlyBuckets(
  leads: { status: string; checkInDate?: string; recordedAt?: string }[],
  monthsBack = 6
): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en', { month: 'short' });
    buckets.push({ key, label, closed: 0, open: 0, follow_up: 0, total: 0 });
  }

  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));

  leads.forEach((l) => {
    const raw = (l.checkInDate || l.recordedAt || '').slice(0, 7);
    const b = map[raw];
    if (!b) return;
    b.total++;
    if (l.status === 'closed') b.closed++;
    else if (l.status === 'follow_up') b.follow_up++;
    else b.open++;
  });

  return buckets;
}
