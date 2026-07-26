'use client';

import React, { useState } from 'react';
import { StaffUser } from '@/types/crm';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Tag,
  Edit,
  Award,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Plus
} from 'lucide-react';

interface StaffProfileCardProps {
  staff: StaffUser;
  isEditable?: boolean;
}

export const StaffProfileCard: React.FC<StaffProfileCardProps> = ({ staff, isEditable = true }) => {
  const { user, isAdmin, updateProfile, updateStaffByAdmin } = useAuth();
  const { leads } = useCRM();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: staff.name,
    phone: staff.phone,
    email: staff.email,
    devicePersonalNumber: staff.devicePersonalNumber || '',
    expertise: staff.expertise || staff.focusArea || '',
    languagesKnown: staff.languagesKnown || '',
    bio: staff.bio || ''
  });

  // Calculate live stats for this staff member
  const staffLeads = leads.filter((l) => l.staffId === staff.id);
  const wonLeads = staffLeads.filter((l) => l.status === 'closed');
  const revenue = 0;
  const conversionRate = staffLeads.length > 0 ? Math.round((wonLeads.length / staffLeads.length) * 100) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id === staff.id) {
      updateProfile({
        ...formData,
        focusArea: formData.expertise,
        department: formData.expertise
      });
    } else if (isAdmin) {
      updateStaffByAdmin(staff.id, {
        ...formData,
        focusArea: formData.expertise,
        department: formData.expertise
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden min-w-0">
      {/* Top Banner Gradient */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border-b border-slate-800/80 -z-0" />

      <div className="relative z-10 pt-4">
        {/* Main Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex items-end gap-3 sm:gap-4 min-w-0">
            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-slate-900 shadow-xl shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white break-words">{staff.name}</h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border shrink-0 ${
                    staff.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {staff.role === 'admin' ? 'CRM Admin' : 'Sales Consultant'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 break-words">
                {staff.expertise || staff.department || 'Staff'}
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 break-words">
                  {staff.expertise || staff.focusArea || 'General'}
                </span>
                {staff.languagesKnown && (
                  <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 break-words">
                    {staff.languagesKnown}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {isEditable && (user?.id === staff.id || isAdmin) && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 min-h-11 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition border border-blue-500/30"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form Drawer */}
        {isEditing ? (
          <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 mb-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Update Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tripeloo Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Personal Number</label>
                <input
                  type="text"
                  value={formData.devicePersonalNumber}
                  onChange={(e) => setFormData({ ...formData, devicePersonalNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expertise</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Languages Known</label>
                <input
                  type="text"
                  value={formData.languagesKnown}
                  onChange={(e) => setFormData({ ...formData, languagesKnown: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-xs">Profile Bio</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 min-h-11 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-3 min-h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          /* Profile Details Info */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 block">Tripeloo Number</span>
                <a href={`tel:${staff.phone}`} className="font-mono font-bold text-white hover:underline truncate block">
                  {staff.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 block">Personal Number</span>
                <span className="font-mono font-medium text-slate-200 truncate block">
                  {staff.devicePersonalNumber || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 block">Work Email</span>
                <span className="font-medium text-slate-200 truncate block">{staff.email}</span>
              </div>
            </div>
          </div>
        )}

        {staff.bio && !isEditing && (
          <p className="text-xs text-slate-400 mb-6 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 italic">
            "{staff.bio}"
          </p>
        )}

        {/* Live Performance KPI Grid */}
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Assigned Leads</span>
            <p className="text-xl font-extrabold text-white mt-2">{staffLeads.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Closed Leads</span>
            <p className="text-xl font-extrabold text-emerald-400 mt-2">{wonLeads.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Won Revenue</span>
            <p className="text-xl font-extrabold text-amber-300 mt-2">₹{revenue.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Win Rate</span>
            <p className="text-xl font-extrabold text-indigo-400 mt-2">{conversionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
