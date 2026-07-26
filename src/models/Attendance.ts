import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar?: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked_in' | 'checked_out' | 'on_leave';
  notes?: string;
  totalHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    id: { type: String, required: true, unique: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    staffAvatar: { type: String, default: '' },
    date: { type: String, required: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out', 'on_leave'],
      default: 'checked_in'
    },
    notes: { type: String, default: '' },
    totalHours: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: 'attendance_records' // Separate collection for Attendance
  }
);

export const AttendanceModel: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
