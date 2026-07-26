'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StaffUser,
  UserRole,
  AttendanceRecord,
  AttendanceStatus,
  StaffRegisterPayload
} from '@/types/crm';

interface AuthContextType {
  user: StaffUser | null;
  staffMembers: StaffUser[];
  isAdmin: boolean;
  isReady: boolean;
  attendanceRecords: AttendanceRecord[];
  loginWithPhone: (
    phone: string,
    password: string
  ) => Promise<{ ok: boolean; code?: string; message?: string }>;
  registerStaff: (
    data: StaffRegisterPayload
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  switchActiveUser: (userId: string) => void;
  updateProfile: (updatedData: Partial<StaffUser>) => void;
  updateStaffByAdmin: (staffId: string, updatedData: Partial<StaffUser>) => void;
  checkInStaff: (notes?: string) => void;
  checkOutStaff: (notes?: string) => void;
  getActiveAttendance: (staffId: string) => AttendanceRecord | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DATA_VERSION = 'tripeloo_v4_auth_clean';
const LOCAL_STORAGE_USER = 'tripeloo_auth_user';
const LOCAL_STORAGE_STAFF = 'tripeloo_staff_list';
const LOCAL_STORAGE_ATTENDANCE = 'tripeloo_attendance_records';
const LOCAL_STORAGE_LEADS = 'tripeloo_crm_leads';
const LOCAL_STORAGE_VERSION = 'tripeloo_data_version';

function clearAllLocalData() {
  localStorage.removeItem(LOCAL_STORAGE_USER);
  localStorage.removeItem(LOCAL_STORAGE_STAFF);
  localStorage.removeItem(LOCAL_STORAGE_ATTENDANCE);
  localStorage.removeItem(LOCAL_STORAGE_LEADS);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>([]);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function boot() {
      // Full wipe of old dummy / leftover client data once
      const version = localStorage.getItem(LOCAL_STORAGE_VERSION);
      if (version !== DATA_VERSION) {
        clearAllLocalData();
        try {
          await fetch('/api/reset', { method: 'POST' });
        } catch (e) {
          console.warn('Failed to reset MongoDB collections:', e);
        }
        localStorage.setItem(LOCAL_STORAGE_VERSION, DATA_VERSION);
      }

      // Load staff directory
      try {
        const res = await fetch('/api/staff');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setStaffMembers(json.data);
          localStorage.setItem(LOCAL_STORAGE_STAFF, JSON.stringify(json.data));
        }
      } catch (err) {
        console.warn('Staff fetch failed:', err);
      }

      // Load attendance
      try {
        const res = await fetch('/api/attendance');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAttendanceRecords(json.data);
          localStorage.setItem(LOCAL_STORAGE_ATTENDANCE, JSON.stringify(json.data));
        }
      } catch (err) {
        console.warn('Attendance fetch failed:', err);
      }

      // Restore session only if still present in DB staff list
      try {
        const savedUser = localStorage.getItem(LOCAL_STORAGE_USER);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser) as StaffUser;
          const res = await fetch('/api/staff');
          const json = await res.json();
          const stillExists =
            json.success &&
            Array.isArray(json.data) &&
            json.data.some((s: StaffUser) => s.id === parsedUser.id);
          if (stillExists) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_USER);
          }
        }
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_USER);
      }

      setIsReady(true);
    }

    boot();
  }, []);

  const persistStaff = (newList: StaffUser[]) => {
    setStaffMembers(newList);
    localStorage.setItem(LOCAL_STORAGE_STAFF, JSON.stringify(newList));
  };

  const persistUser = (currentUser: StaffUser | null) => {
    setUser(currentUser);
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER);
    }
  };

  const persistAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords(records);
    localStorage.setItem(LOCAL_STORAGE_ATTENDANCE, JSON.stringify(records));
  };

  const loginWithPhone = async (phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const json = await res.json();

      if (json.success && json.data) {
        persistUser(json.data);
        // refresh staff list
        setStaffMembers((prev) => {
          const exists = prev.some((s) => s.id === json.data.id);
          const next = exists ? prev.map((s) => (s.id === json.data.id ? json.data : s)) : [...prev, json.data];
          localStorage.setItem(LOCAL_STORAGE_STAFF, JSON.stringify(next));
          return next;
        });
        return { ok: true };
      }

      return {
        ok: false,
        code: json.code || 'ERROR',
        message: json.message || 'Login failed'
      };
    } catch (e: any) {
      return { ok: false, code: 'NETWORK', message: e.message || 'Network error' };
    }
  };

  const registerStaff = async (data: StaffRegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.success && json.data) {
        persistUser(json.data);
        persistStaff([...staffMembers.filter((s) => s.id !== json.data.id), json.data]);
        return { ok: true };
      }

      return { ok: false, message: json.message || 'Registration failed' };
    } catch (e: any) {
      return { ok: false, message: e.message || 'Network error' };
    }
  };

  const logout = () => {
    persistUser(null);
  };

  const switchUserRole = (role: UserRole) => {
    if (!user) return;
    const updatedUser: StaffUser = { ...user, role };
    persistUser(updatedUser);
    const updatedStaff = staffMembers.map((s) => (s.id === user.id ? updatedUser : s));
    persistStaff(updatedStaff);

    fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch((e) => console.error('Failed to update staff role:', e));
  };

  const switchActiveUser = (userId: string) => {
    const target = staffMembers.find((s) => s.id === userId);
    if (target) persistUser(target);
  };

  const updateProfile = (updatedData: Partial<StaffUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    persistUser(updatedUser);
    const updatedStaff = staffMembers.map((s) => (s.id === user.id ? updatedUser : s));
    persistStaff(updatedStaff);

    fetch('/api/staff', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch((e) => console.error('Failed to update profile:', e));
  };

  const updateStaffByAdmin = (staffId: string, updatedData: Partial<StaffUser>) => {
    let targetToSync: StaffUser | null = null;
    const updatedStaff = staffMembers.map((s) => {
      if (s.id === staffId) {
        targetToSync = { ...s, ...updatedData };
        return targetToSync;
      }
      return s;
    });
    persistStaff(updatedStaff);
    if (user?.id === staffId && targetToSync) persistUser(targetToSync);

    if (targetToSync) {
      fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetToSync)
      }).catch((e) => console.error('Failed to update staff by admin:', e));
    }
  };

  const checkInStaff = (notes = 'Checked in for daily shift') => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      staffId: user.id,
      staffName: user.name,
      staffAvatar: user.avatar,
      date: today,
      checkInTime: nowTime,
      status: 'checked_in',
      notes,
      totalHours: 0
    };

    persistAttendance([newRecord, ...attendanceRecords]);

    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    }).catch((e) => console.error('Failed to sync check-in:', e));
  };

  const checkOutStaff = (notes = 'Shift completed') => {
    if (!user) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedRecordToSync: AttendanceRecord | null = null;

    const updated = attendanceRecords.map((rec) => {
      if (rec.staffId === user.id && rec.status === 'checked_in') {
        updatedRecordToSync = {
          ...rec,
          checkOutTime: nowTime,
          status: 'checked_out' as AttendanceStatus,
          notes: notes || rec.notes,
          totalHours: rec.totalHours ? rec.totalHours + 4.5 : 8.0
        };
        return updatedRecordToSync;
      }
      return rec;
    });

    persistAttendance(updated);

    if (updatedRecordToSync) {
      fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecordToSync)
      }).catch((e) => console.error('Failed to sync check-out:', e));
    }
  };

  const getActiveAttendance = (staffId: string) => {
    return attendanceRecords.find((r) => r.staffId === staffId && r.status === 'checked_in');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        staffMembers,
        isAdmin: user?.role === 'admin',
        isReady,
        attendanceRecords,
        loginWithPhone,
        registerStaff,
        logout,
        switchUserRole,
        switchActiveUser,
        updateProfile,
        updateStaffByAdmin,
        checkInStaff,
        checkOutStaff,
        getActiveAttendance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
