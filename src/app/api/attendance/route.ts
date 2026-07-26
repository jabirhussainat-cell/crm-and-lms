import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AttendanceModel } from '@/models/Attendance';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    // Remove attendance tied to previously seeded demo staff
    await AttendanceModel.deleteMany({
      staffId: { $in: ['usr_admin', 'usr_staff1', 'usr_staff2'] }
    });

    const records = await AttendanceModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    console.error('API Error /api/attendance GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'MongoDB not connected' }, { status: 503 });
    }

    const body = await request.json();

    // If ID provided, update existing attendance record (e.g. Check-Out), else create new
    if (body.id) {
      const updated = await AttendanceModel.findOneAndUpdate({ id: body.id }, body, { upsert: true, new: true });
      return NextResponse.json({ success: true, data: updated });
    }

    const newRecord = await AttendanceModel.create(body);
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    console.error('API Error /api/attendance POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
