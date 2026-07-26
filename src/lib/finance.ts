import { Lead, Expense } from '@/types/crm';

export const STAFF_PROFIT_SHARE = 0.4;
export const TRIPELOO_PROFIT_SHARE = 0.6;

/** Parse currency-like strings into numbers (₹15,000 / 15000 / 15k). */
export function parseMoney(value?: string | number | null): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  const raw = String(value).trim().toLowerCase().replace(/,/g, '');
  const kMatch = raw.match(/^([\d.]+)\s*k$/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  const digits = raw.replace(/[^\d.-]/g, '');
  const n = parseFloat(digits);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Deal profit from a closed lead:
 * - profitShare = "B2B" → profit = B2B − B2C
 * - profitShare = number (e.g. 10 or 10%) → profit = B2B × (pct / 100)
 *   e.g. B2B 5000, 10% → 500
 */
export function dealProfit(lead: Lead): number {
  if (lead.status !== 'closed') return 0;

  const b2b = parseMoney(lead.b2b);
  const b2c = parseMoney(lead.b2c);
  const shareRaw = String(lead.profitShare || lead.propertyType || '').trim();

  if (!shareRaw) return 0;

  if (/^b2b$/i.test(shareRaw)) {
    return Math.max(0, b2b - b2c);
  }

  const pct = parseMoney(shareRaw.replace(/%/g, ''));
  if (pct > 0) {
    return b2b * (pct / 100);
  }

  return 0;
}

export function staffEarningFromDeal(lead: Lead): number {
  return dealProfit(lead) * STAFF_PROFIT_SHARE;
}

export function tripelooShareFromDeal(lead: Lead): number {
  return dealProfit(lead) * TRIPELOO_PROFIT_SHARE;
}

/** @deprecated use dealProfit / tripelooShareFromDeal */
export function leadRevenue(lead: Lead): number {
  return tripelooShareFromDeal(lead);
}

export function formatINR(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return n < 0 ? `−₹${formatted}` : `₹${formatted}`;
}

/** Profit: +₹…  |  Loss: -₹… */
export function formatProfitLoss(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (n > 0) return `+₹${formatted}`;
  if (n < 0) return `-₹${formatted}`;
  return `₹${formatted}`;
}

export function profitLossColor(n: number): string {
  if (n > 0) return 'text-emerald-400';
  if (n < 0) return 'text-red-500';
  return 'text-slate-300';
}

export function inDateRange(dateStr: string, from?: string, to?: string): boolean {
  const d = (dateStr || '').slice(0, 10);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export interface FinanceBucket {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface StaffEarningsRow {
  staffId: string;
  staffName: string;
  dealsClosed: number;
  dealProfit: number;
  staffEarnings: number;
  tripelooShare: number;
}

export function buildStaffEarnings(
  leads: Lead[],
  dateFrom?: string,
  dateTo?: string
): StaffEarningsRow[] {
  const map = new Map<string, StaffEarningsRow>();

  leads.forEach((l) => {
    if (l.status !== 'closed') return;
    const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
    if (!inDateRange(d, dateFrom, dateTo)) return;

    const profit = dealProfit(l);
    if (!map.has(l.staffId)) {
      map.set(l.staffId, {
        staffId: l.staffId,
        staffName: l.staffName,
        dealsClosed: 0,
        dealProfit: 0,
        staffEarnings: 0,
        tripelooShare: 0
      });
    }
    const row = map.get(l.staffId)!;
    row.dealsClosed += 1;
    row.dealProfit += profit;
    row.staffEarnings += profit * STAFF_PROFIT_SHARE;
    row.tripelooShare += profit * TRIPELOO_PROFIT_SHARE;
  });

  return Array.from(map.values()).sort((a, b) => b.staffEarnings - a.staffEarnings);
}

/** Dashboard charts: revenue = Tripeloo 60% share; profit = that − expenses */
export function buildMonthlyFinance(
  leads: Lead[],
  expenses: Expense[],
  monthsBack = 6,
  dateFrom?: string,
  dateTo?: string
): FinanceBucket[] {
  const now = new Date();
  const buckets: FinanceBucket[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en', { month: 'short', year: '2-digit' });
    buckets.push({ key, label, revenue: 0, expenses: 0, profit: 0 });
  }

  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));

  leads.forEach((l) => {
    if (l.status !== 'closed') return;
    const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
    if (!inDateRange(d, dateFrom, dateTo)) return;
    const key = d.slice(0, 7);
    if (!map[key]) return;
    map[key].revenue += tripelooShareFromDeal(l);
  });

  expenses.forEach((e) => {
    const d = (e.date || '').slice(0, 10);
    if (!inDateRange(d, dateFrom, dateTo)) return;
    const key = d.slice(0, 7);
    if (!map[key]) return;
    map[key].expenses += Number(e.amount) || 0;
  });

  buckets.forEach((b) => {
    b.profit = b.revenue - b.expenses;
  });

  return buckets;
}

export function buildQuarterlyFinance(
  leads: Lead[],
  expenses: Expense[],
  dateFrom?: string,
  dateTo?: string
): FinanceBucket[] {
  const year = new Date().getFullYear();
  const buckets: FinanceBucket[] = [1, 2, 3, 4].map((q) => ({
    key: `${year}-Q${q}`,
    label: `Q${q} ${year}`,
    revenue: 0,
    expenses: 0,
    profit: 0
  }));

  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));

  const quarterKey = (dateStr: string) => {
    const d = dateStr.slice(0, 10);
    if (!d.startsWith(String(year))) return null;
    const month = parseInt(d.slice(5, 7), 10);
    if (!month) return null;
    const q = Math.ceil(month / 3);
    return `${year}-Q${q}`;
  };

  leads.forEach((l) => {
    if (l.status !== 'closed') return;
    const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
    if (!inDateRange(d, dateFrom, dateTo)) return;
    const key = quarterKey(d);
    if (!key || !map[key]) return;
    map[key].revenue += tripelooShareFromDeal(l);
  });

  expenses.forEach((e) => {
    const d = (e.date || '').slice(0, 10);
    if (!inDateRange(d, dateFrom, dateTo)) return;
    const key = quarterKey(d);
    if (!key || !map[key]) return;
    map[key].expenses += Number(e.amount) || 0;
  });

  buckets.forEach((b) => {
    b.profit = b.revenue - b.expenses;
  });

  return buckets;
}
