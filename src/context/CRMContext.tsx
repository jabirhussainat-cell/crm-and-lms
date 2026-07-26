'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, LeadFilterState, ActivityNote } from '@/types/crm';

export const INITIAL_LEADS: Lead[] = [];

interface CRMContextType {
  leads: Lead[];
  filters: LeadFilterState;
  setFilters: React.Dispatch<React.SetStateAction<LeadFilterState>>;
  resetFilters: () => void;
  filteredLeads: Lead[];
  addLead: (leadData: Omit<Lead, 'id' | 'activityLog' | 'recordedAt'>) => Promise<void>;
  updateLead: (id: string, updatedData: Partial<Lead>, authorName?: string) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus, authorName?: string) => void;
  getLeadById: (id: string) => Lead | undefined;
  getStaffLeads: (staffId: string, dateFrom?: string, dateTo?: string) => Lead[];
  stats: {
    totalLeads: number;
    closedCount: number;
    openCount: number;
    byStatus: Record<LeadStatus, number>;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const LOCAL_STORAGE_LEADS = 'tripeloo_crm_leads_v2';

const INITIAL_FILTERS: LeadFilterState = {
  searchQuery: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  staffId: 'all',
  sortBy: 'date_desc'
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [filters, setFilters] = useState<LeadFilterState>(INITIAL_FILTERS);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const valid = json.data.filter((l: Lead) => l.customerName && l.staffId);
          setLeads(valid);
          localStorage.setItem(LOCAL_STORAGE_LEADS, JSON.stringify(valid));
          return;
        }
      } catch (e) {
        console.warn('MongoDB API fetch failed, falling back to localStorage:', e);
      }

      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_LEADS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setLeads(parsed);
        }
      } catch (e) {
        console.error('Failed to load leads from localStorage:', e);
      }
    }

    fetchLeads();
  }, []);

  const persistLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem(LOCAL_STORAGE_LEADS, JSON.stringify(newLeads));
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'activityLog' | 'recordedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      recordedAt: new Date().toISOString(),
      activityLog: [
        {
          id: `act_${Date.now()}`,
          author: leadData.staffName || 'Staff',
          text: `Lead recorded — status '${leadData.status}'.`,
          timestamp: new Date().toLocaleString()
        }
      ]
    };
    persistLeads([newLead, ...leads]);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
    } catch (e) {
      console.error('Failed to sync new lead to MongoDB:', e);
    }
  };

  const updateLead = async (id: string, updatedData: Partial<Lead>, authorName = 'Staff') => {
    let target: Lead | null = null;
    const updated = leads.map((lead) => {
      if (lead.id !== id) return lead;
      const logEntry: ActivityNote = {
        id: `act_${Date.now()}`,
        author: authorName,
        text: `Lead updated (Status: ${updatedData.status || lead.status}).`,
        timestamp: new Date().toLocaleString()
      };
      target = {
        ...lead,
        ...updatedData,
        activityLog: [logEntry, ...(lead.activityLog || [])]
      };
      return target;
    });
    persistLeads(updated);

    if (target) {
      try {
        await fetch('/api/leads', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
      } catch (e) {
        console.error('Failed to sync lead update:', e);
      }
    }
  };

  const updateLeadStatus = (id: string, status: LeadStatus, authorName = 'Staff') => {
    updateLead(id, { status }, authorName);
  };

  const deleteLead = async (id: string) => {
    persistLeads(leads.filter((l) => l.id !== id));
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete lead:', e);
    }
  };

  const getLeadById = (id: string) => leads.find((l) => l.id === id);

  const getStaffLeads = (staffId: string, dateFrom?: string, dateTo?: string) => {
    return leads.filter((l) => {
      if (l.staffId !== staffId) return false;
      const d = (l.checkInDate || l.recordedAt || '').slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  };

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const match =
            lead.customerName.toLowerCase().includes(q) ||
            lead.location.toLowerCase().includes(q) ||
            (lead.customerContactNumber || '').includes(q) ||
            (lead.propertyName || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        if (filters.status !== 'all' && lead.status !== filters.status) return false;
        if (filters.staffId !== 'all' && lead.staffId !== filters.staffId) return false;
        const d = (lead.checkInDate || lead.recordedAt || '').slice(0, 10);
        if (filters.dateFrom && d < filters.dateFrom) return false;
        if (filters.dateTo && d > filters.dateTo) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name') return a.customerName.localeCompare(b.customerName);
        const da = a.checkInDate || a.recordedAt;
        const db = b.checkInDate || b.recordedAt;
        if (filters.sortBy === 'date_asc') return da.localeCompare(db);
        return db.localeCompare(da);
      });
  }, [leads, filters]);

  const stats = useMemo(() => {
    const byStatus: Record<LeadStatus, number> = { open: 0, closed: 0, follow_up: 0 };
    leads.forEach((l) => {
      if (byStatus[l.status] !== undefined) byStatus[l.status]++;
    });
    return {
      totalLeads: leads.length,
      closedCount: byStatus.closed,
      openCount: byStatus.open,
      byStatus
    };
  }, [leads]);

  return (
    <CRMContext.Provider
      value={{
        leads,
        filters,
        setFilters,
        resetFilters,
        filteredLeads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        getLeadById,
        getStaffLeads,
        stats
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
