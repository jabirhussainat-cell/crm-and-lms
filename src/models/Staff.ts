import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaffStats {
  totalLeads: number;
  closedWon: number;
  revenue: number;
}

export interface IStaff extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  devicePersonalNumber: string;
  expertise: string;
  languagesKnown: string;
  role: 'admin' | 'staff';
  avatar?: string;
  designation?: string;
  adminNotes?: string;
  department?: string;
  focusArea?: string;
  joinDate: string;
  bio?: string;
  stats: IStaffStats;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    devicePersonalNumber: { type: String, default: '' },
    expertise: { type: String, default: '' },
    languagesKnown: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    avatar: { type: String, default: '' },
    designation: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    department: { type: String, default: '' },
    focusArea: { type: String, default: '' },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    bio: { type: String, default: '' },
    stats: {
      totalLeads: { type: Number, default: 0 },
      closedWon: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    collection: 'staff_directory'
  }
);

// Drop stale model so schema changes apply in dev HMR
if (mongoose.models.Staff) {
  delete mongoose.models.Staff;
}

export const StaffModel: Model<IStaff> = mongoose.model<IStaff>('Staff', StaffSchema);

/** Return staff object without password for client use */
export function sanitizeStaff(doc: any) {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.__v;
  delete obj._id;
  return obj;
}
