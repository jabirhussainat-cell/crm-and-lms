'use client';

import { Lead } from '@/types/crm';

export const LeadTable: React.FC<{ leads: Lead[]; onEdit?: (l: Lead) => void }> = ({ leads }) => (
  <div className="space-y-2">
    {leads.map((l) => (
      <div key={l.id} className="text-xs text-slate-300 p-2 border border-slate-800 rounded-lg">
        {l.customerName} — {l.status} — {l.checkInDate}
      </div>
    ))}
  </div>
);
