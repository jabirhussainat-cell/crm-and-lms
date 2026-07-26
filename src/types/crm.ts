export type UserRole = 'admin' | 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  /** Tripeloo (work) number — used for login */
  phone: string;
  password?: string;
  /** Personal number */
  devicePersonalNumber: string;
  expertise: string;
  languagesKnown: string;
  role: UserRole;
  avatar: string;
  /** Job designation — editable by admin */
  designation?: string;
  /** Internal notes — visible to admin only */
  adminNotes?: string;
  department?: string;
  focusArea?: string;
  joinDate: string;
  bio?: string;
  stats?: {
    totalLeads: number;
    closedWon: number;
    revenue: number;
  };
}

/** Staff-recorded lead statuses */
export type LeadStatus = 'open' | 'closed' | 'follow_up';

export interface ActivityNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  customerName: string;
  noOfKids: number;
  noOfAdults: number;
  checkInDate: string;
  checkOutDate: string;
  location: string;
  status: LeadStatus;
  customerNotes: string;

  /** Business fields — filled when status is closed */
  customerContactNumber?: string;
  /** Property name */
  propertyName?: string;
  /**
   * Profit share with property & Tripeloo.
   * Free string: "% type" (e.g. 15%) or "B2B" or any number.
   */
  profitShare?: string;
  /** @deprecated use profitShare */
  propertyType?: string;
  /** Optional B2B / booking ref */
  b2bRef?: string;
  cusAdv?: string;
  advToProperty?: string;
  b2b?: string;
  b2c?: string;

  staffId: string;
  staffName: string;
  recordedAt: string;
  activityLog: ActivityNote[];
}

export type ViewMode = 'grid' | 'table' | 'kanban';

export interface LeadFilterState {
  searchQuery: string;
  status: LeadStatus | 'all';
  dateFrom: string;
  dateTo: string;
  staffId: string;
  sortBy: 'date_desc' | 'date_asc' | 'name';
}

export type AttendanceStatus = 'checked_in' | 'checked_out';

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
  totalHours?: number;
}

export interface AttendanceFilterState {
  staffId: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month';
  status: AttendanceStatus | 'all';
  searchQuery: string;
}

export interface StaffRegisterPayload {
  name: string;
  phone: string;
  password: string;
  devicePersonalNumber: string;
  email: string;
  expertise: string;
  languagesKnown: string;
}

export type AdminNoteLabel = 'Accounts' | 'Operations' | 'Tech' | 'HR' | 'Sales' | 'General';

export const ADMIN_NOTE_LABELS: AdminNoteLabel[] = [
  'Accounts',
  'Operations',
  'Tech',
  'HR',
  'Sales',
  'General'
];

export interface AdminNote {
  id: string;
  text: string;
  label: AdminNoteLabel;
  date: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Operations'
  | 'Marketing'
  | 'Salaries'
  | 'Travel'
  | 'Tech'
  | 'Property'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Operations',
  'Marketing',
  'Salaries',
  'Travel',
  'Tech',
  'Property',
  'Other'
];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export type IncomeCategory =
  | 'Deals'
  | 'Other income'
  | 'Refund'
  | 'Adjustment'
  | 'Other';

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Deals',
  'Other income',
  'Refund',
  'Adjustment',
  'Other'
];

export interface Income {
  id: string;
  title: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}
