import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { StaffModel } from '@/models/Staff';
import { LeadModel } from '@/models/Lead';
import { AttendanceModel } from '@/models/Attendance';

/** One-shot wipe of all CRM collections (staff, leads, attendance). */
export async function POST() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const [staff, leads, attendance, expenses, notes] = await Promise.all([
      StaffModel.deleteMany({}),
      LeadModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      (await import('@/models/Expense')).ExpenseModel.deleteMany({}),
      (await import('@/models/AdminNote')).AdminNoteModel.deleteMany({})
    ]);

    return NextResponse.json({
      success: true,
      message: 'All CRM data cleared',
      deleted: {
        staff: staff.deletedCount,
        leads: leads.deletedCount,
        attendance: attendance.deletedCount,
        expenses: expenses.deletedCount,
        notes: notes.deletedCount
      }
    });
  } catch (error: any) {
    console.error('API Error /api/reset POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
