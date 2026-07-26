'use client';

import { Lead } from '@/types/crm';

/** Legacy card — use staff portal record-leads instead */
export const LeadCard: React.FC<{ lead: Lead; onEdit?: (l: Lead) => void }> = ({ lead }) => (
  <div className="p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
    {lead.customerName} · {lead.status}
  </div>
);
